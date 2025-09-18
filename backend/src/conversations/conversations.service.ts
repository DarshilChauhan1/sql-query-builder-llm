import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { ResponseHandler } from 'src/common/utils/response-handler.utils';
import { DBType } from 'src/common/enums/DBtype.enum';
import { Client as PgClient } from "pg";
import { Observable } from 'rxjs';
import { CreateMessageStreamDto } from './dto/create-message-stream.dto';
import { StreamEventData } from './types/stream-events.types';


@Injectable()
export class ConversationsService {
  openAI: OpenAI
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    this.openAI = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY')
    })
  }

  private systemPrompt = `
  You are an expert in SQL Query and Database with 10 years of experience.
  You are given a user's natural language prompt and the results of an SQL query executed against their database.
  Your task is to generate a clear, concise, and accurate response to the user's prompt based on the query results.
  If the query results do not contain relevant information to answer the user's prompt, respond with "I'm sorry, but I don't have enough information to answer that question based on the provided data."
  You will be given the SQL Query results in JSON format.
  Understand the user's intent and the context of the data.
  Always ensure your response is factual and directly supported by the query results.
  Here are some guidelines to follow:
  1. Understand the user's intent from their natural language prompt.
  2. Analyze the SQL query results to extract relevant information.
  3. Formulate a response that directly addresses the user's prompt using only the information available in the query results.
  4. If the query results are empty or do not pertain to the user's question, politely inform them that you cannot provide an answer based on the available data.
  5. Keep your response clear, concise, and free of any assumptions or external knowledge not present in the query results.
  `

  async create(createConversationDto: CreateConversationDto, userId: string) {
    const { workspaceId, prompt } = createConversationDto;

    const getWorkSpaceDetails = await this.prisma.workspace.findUnique({
      where: { id: workspaceId, userId: userId },
      include: { databaseConnection: true }
    })

    // first save the message of that conversations 

    if (!getWorkSpaceDetails) throw new NotFoundException('Workspace not found');
    // get the schemas for the DB connections
    const schemas = getWorkSpaceDetails.databaseConnection?.schema;
    if (!schemas) throw new NotFoundException('Database connection not found Please add the database connection');

    // first create the conversation with title
    const generateConversationTitle = await this.generateRelevantTitle(prompt)

    if (!generateConversationTitle.success) throw new NotFoundException('Failed to generate conversation title');

    const title = generateConversationTitle.data;
    const createConversation = await this.prisma.conversation.create({
      data: {
        title,
        workspaceId: getWorkSpaceDetails.id,
        userId
      }
    })

    // Then create a user message for that conversation
    const createUserMessage = await this.prisma.messages.create({
      data: {
        conversationId: createConversation.id,
        role: 'user',
        messageId: 0,
        prompt,
        userId
      }
    })

    return new ResponseHandler('Conversation created successfully', 201, true, {
      conversationId: createConversation.id,
      title: createConversation.title,
      prompt: createUserMessage.prompt
    });
  }

  async createMessageStream(createMessageStream: CreateMessageStreamDto, userId: string): Promise<Observable<StreamEventData>> {
    const { conversationId, prompt } = createMessageStream;

    // Validate conversation access and get workspace details
    const conversation = await this.prisma.conversation.findFirst({
      where: { 
        id: conversationId,
        userId: userId // Ensure user owns the conversation
      },
      include: {
        workspace: {
          include: { databaseConnection: true }
        }
      }
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    if (!conversation.workspace.databaseConnection?.schema) {
      throw new NotFoundException('Database schema not configured for this workspace');
    }

    const { workspace } = conversation;
    const schemas = workspace.databaseConnection!.schema;

    if(!workspace.databaseConnection) throw new NotFoundException('Database connection not configured for this workspace');

    return new Observable<StreamEventData>((subscriber) => {
      this.processMessageStream(conversationId, prompt, schemas, workspace.databaseConnection, userId, subscriber)
        .catch(error => {
          console.error('Stream processing error:', error);
          subscriber.error(error);
        });
    });
  }

  private async processMessageStream(
    conversationId: string,
    prompt: string,
    schemas: any,
    dbConnection: any,
    userId: string,
    subscriber: any
  ) {
    let userMessage: any;
    let sqlQuery = '';
    let queryResults: any = [];

    try {
      // Get the next message ID for this conversation
      const messageCount = await this.prisma.messages.count({
        where: { conversationId }
      });

      // 1. Create user message first
      userMessage = await this.prisma.messages.create({
        data: {
          conversationId,
          userId,
          role: 'user',
          prompt: prompt,
          sqlQuery: '', // Will be updated after query generation
          messageId: messageCount
        }
      });

      // 2. Generate SQL query
      try {
        const queryResponse = await this.generateSQLQuery(prompt, JSON.stringify(schemas));
        if (queryResponse.success) {
          sqlQuery = queryResponse.data;
          
          // Update user message with generated SQL
          await this.prisma.messages.update({
            where: { id: userMessage.id },
            data: { sqlQuery }
          });
        }
      } catch (error) {
        console.error('SQL generation failed:', error);
        subscriber.next({
          type: 'error',
          message: 'Failed to generate SQL query'
        });
        throw error;
      }

      // 3. Execute SQL query
      try {
        const executionResult = await this.executeSQLQuery(
          sqlQuery,
          dbConnection.dbType,
          dbConnection.connectionString
        );
        
        if(!executionResult.success) {
          subscriber.next({
            type: 'error',
            message: 'SQL query execution failed'
          });
        }
      } catch (error) {
        console.error('SQL execution failed:', error);
        subscriber.next({
          type: 'error',
          message: 'Failed to execute SQL query'
        });
        throw error;
      }

      // 4. Stream LLM response
      const llmPrompt = `
        ${this.systemPrompt}
        Here is the SQL Query that was executed: ${sqlQuery}
        Here is the SQL Query Results: ${JSON.stringify(queryResults)}
        User's Question: ${prompt}
      `;

      let fullResponse = '';
      const chatResponse = await this.openAI.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: llmPrompt }],
        max_tokens: 1024,
        temperature: 0.2,
        stream: true,
      });

      subscriber.next({ type: 'llm_stream_start' });

      for await (const chunk of chatResponse) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          fullResponse += delta;
          subscriber.next({
            type: 'llm_chunk',
            data: { content: delta }
          });
        }
      }

      // 5. Save assistant message
      const assistantMessage = await this.prisma.messages.create({
        data: {
          conversationId,
          userId,
          role: 'assistant',
          prompt: fullResponse,
          sqlQuery,
          queryResult: JSON.stringify(queryResults),
          messageId: messageCount + 1
        }
      });

      subscriber.complete();

    } catch (error) {
      console.error('Stream processing error:', error);
      
      // Try to save error state if user message was created
      if (userMessage) {
        try {
          const errorMessageCount = await this.prisma.messages.count({
            where: { conversationId }
          });

          await this.prisma.messages.create({
            data: {
              conversationId,
              userId,
              role: 'assistant',
              prompt: 'Sorry, I encountered an error processing your request. Please try again.',
              sqlQuery: sqlQuery || '',
              queryResult: JSON.stringify({ error: error.message }),
              messageId: errorMessageCount
            }
          });
        } catch (saveError) {
          console.error('Failed to save error message:', saveError);
        }
      }

      subscriber.error(error);
    }
  }

  findAll() {
    return `This action returns all conversations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} conversation`;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }

  private async generateSQLQuery(prompt: string, schema: string) {
    
    const formattedSchema = this.formatSchemaForPostgres(schema);
    
    const detailedPrompt = `
    You are an expert PostgreSQL query generator with deep knowledge of PostgreSQL syntax and best practices.
    Your job is to take a natural language request and generate a correct, executable PostgreSQL query.
    
    User Question: ${prompt}

    ### PostgreSQL Database Schema:
    ${formattedSchema}

    ### PostgreSQL-Specific Rules:
    1. The query MUST be valid PostgreSQL syntax and executable.
    2. Use proper PostgreSQL data types and functions.
    3. Table names are case-sensitive - use exactly as shown in schema.
    4. Column names are case-sensitive - use exactly as shown in schema.
    5. Use double quotes around identifiers if they contain special characters or mixed case.
    6. Use PostgreSQL-specific operators: ILIKE for case-insensitive matching, ~ for regex.
    7. Use LIMIT instead of TOP for row limiting.
    8. Use PostgreSQL date/time functions: NOW(), CURRENT_DATE, INTERVAL.
    9. Use proper JOIN syntax with explicit JOIN conditions.
    10. For text search, prefer ILIKE over LIKE for case-insensitive searches.
    11. Use appropriate PostgreSQL aggregate functions.
    12. Handle NULL values properly with IS NULL / IS NOT NULL.

    ### Query Construction Guidelines:
    - Always use explicit column names instead of SELECT *
    - Use proper table aliases for readability
    - Include appropriate WHERE clauses for filtering
    - Use ORDER BY when logical ordering is needed
    - Add LIMIT when reasonable result size is expected
    - Use appropriate JOINs to connect related tables
    - Consider performance with proper indexing assumptions

    ### Example Patterns:
    - String matching: WHERE column_name ILIKE '%search_term%'
    - Date filtering: WHERE date_column >= NOW() - INTERVAL '7 days'
    - Joins: FROM table1 t1 JOIN table2 t2 ON t1.id = t2.foreign_id
    - Limiting: ORDER BY column_name LIMIT 10

    ### Output Format:
    Return ONLY a JSON object with the PostgreSQL query:
    {
      "query": "SELECT column1, column2 FROM table_name WHERE condition ORDER BY column1 LIMIT 10"
    }

    CRITICAL REQUIREMENTS:
    - Return ONLY valid PostgreSQL SQL in the "query" field
    - NO comments, explanations, or additional text
    - NO markdown formatting or code blocks
    - Query must be executable as-is
    - Use exact table and column names from the schema
    - Ensure proper PostgreSQL syntax throughout
    `;

    try {
      const response = await this.openAI.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: detailedPrompt,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: "postgres_query_schema",
            schema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "A valid PostgreSQL query"
                }
              },
              required: ["query"],
              additionalProperties: false
            }
          }
        },
        temperature: 0.1, // Lower temperature for more consistent SQL generation
        max_tokens: 500
      });

      console.log('OpenAI response:', response.choices[0].message?.content);
      const responseContent = JSON.parse(response.choices[0].message?.content || '{}');
      
      if (!responseContent.query) {
        throw new Error('No query generated by OpenAI');
      }

      const sqlQuery = this.cleanAndValidatePostgresQuery(responseContent.query);
      return new ResponseHandler('SQL Query generated successfully', 200, true, sqlQuery);
      
    } catch (error) {
      console.error('Error generating SQL query:', error);
      return new ResponseHandler('Failed to generate SQL query', 500, false, null);
    }
  }

  private formatSchemaForPostgres(schemaString: string): string {
    try {
      const schemas = JSON.parse(schemaString);
      
      if (!Array.isArray(schemas)) {
        return 'Invalid schema format';
      }

      const tableSchemas = new Map();
      
      // Group columns by table name
      schemas.forEach(schemaItem => {
        Object.keys(schemaItem).forEach(tableName => {
          if (!tableSchemas.has(tableName)) {
            tableSchemas.set(tableName, []);
          }
          tableSchemas.get(tableName).push(...schemaItem[tableName]);
        });
      });

      let formattedSchema = 'PostgreSQL Database Tables and Columns:\n\n';
      
      tableSchemas.forEach((columns, tableName) => {
        formattedSchema += `Table: ${tableName}\n`;
        formattedSchema += `Columns:\n`;
        
        // Remove duplicates and sort columns
        const uniqueColumns = columns.filter((col, index, self) => 
          index === self.findIndex(c => c.columnName === col.columnName)
        );
        
        uniqueColumns.forEach(col => {
          const dataType = this.mapPostgresDataType(col.dataType);
          const nullable = col.isNullable === 'YES' ? 'NULL' : 'NOT NULL';
          const maxLength = col.characterMaximumLength ? `(${col.characterMaximumLength})` : '';
          
          formattedSchema += `  - ${col.columnName}: ${dataType}${maxLength} ${nullable}\n`;
        });
        
        formattedSchema += '\n';
      });

      // Add relationship hints based on common patterns
      formattedSchema += this.addRelationshipHints(tableSchemas);
      
      return formattedSchema;
      
    } catch (error) {
      console.error('Error formatting schema:', error);
      return `Raw schema data: ${schemaString}`;
    }
  }

  private mapPostgresDataType(dataType: string): string {
    const typeMapping = {
      'character varying': 'VARCHAR',
      'character': 'CHAR',
      'timestamp without time zone': 'TIMESTAMP',
      'timestamp with time zone': 'TIMESTAMPTZ',
      'USER-DEFINED': 'ENUM',
      'ARRAY': 'ARRAY',
      'tsvector': 'TSVECTOR',
      'bytea': 'BYTEA'
    };
    
    return typeMapping[dataType] || dataType.toUpperCase();
  }

  private addRelationshipHints(tableSchemas: Map<string, any[]>): string {
    let hints = 'Common Relationship Patterns:\n';
    
    // Look for foreign key patterns
    const tables = Array.from(tableSchemas.keys());
    
    tables.forEach(table => {
      const columns = tableSchemas.get(table) || [];
      columns.forEach(col => {
        // Look for ID columns that might be foreign keys
        if (col.columnName.endsWith('_id') && col.columnName !== `${table}_id`) {
          const referencedTable = col.columnName.replace('_id', '');
          if (tables.includes(referencedTable)) {
            hints += `- ${table}.${col.columnName} likely references ${referencedTable}.${referencedTable}_id\n`;
          }
        }
      });
    });
    
    return hints + '\n';
  }

  private cleanAndValidatePostgresQuery(query: string): string {
    // Clean the query
    let cleanedQuery = query
      .replace(/;+$/, '') // Remove trailing semicolons
      .replace(/--.*$/gm, '') // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .trim();

    // Basic PostgreSQL syntax validation
    if (!cleanedQuery.toLowerCase().startsWith('select') && 
        !cleanedQuery.toLowerCase().startsWith('with')) {
      throw new Error('Query must be a SELECT statement');
    }

    // Ensure proper PostgreSQL syntax patterns
    cleanedQuery = cleanedQuery
      .replace(/\bTOP\s+(\d+)\b/gi, 'LIMIT $1') // Replace TOP with LIMIT
      .replace(/\bgetdate\(\)/gi, 'NOW()') // Replace SQL Server functions
      .replace(/\blen\(/gi, 'LENGTH(') // Replace SQL Server functions
      .replace(/\[\w+\]/g, (match) => `"${match.slice(1, -1)}"`) // Replace [column] with "column"

    return cleanedQuery;
  }

  private async executeSQLQuery(sqlQuery: string, dbType: any, connectionString: string) {
    const queryResults: any = [];
    console.log(connectionString)
    switch (dbType) {
      case DBType.POSTGRES: {
        const client = new PgClient(connectionString);
        try {
          await client.connect();
          console.log('Postgres connection established');
          const result = await client.query(sqlQuery);
          queryResults.push(...result.rows);
        } catch (error) {
          console.error('Database query error:', error);
          throw new Error(`Database query failed: ${error.message}`);
        } finally {
          await client.end();
        }
        break;
      }
    }

    return {
      message: 'Query executed successfully',
      success: true,
      data: queryResults
    };
  }

  private async generateRelevantTitle(prompt: string) {
    const llmPromptForTitle = `
    You are an expert at generating concise, descriptive titles for database query conversations.
    Your task is to create a short, meaningful title based on the user's natural language query.
    
    Guidelines:
    1. Keep the title between 3-8 words
    2. Focus on the main intent of the query (what data they're looking for)
    3. Use clear, simple language
    4. Avoid technical jargon unless necessary
    5. Don't include "SQL" or "Query" in the title
    6. Make it descriptive enough to distinguish from other conversations
    
    Examples:
    - User Query: "Show me all users who registered in the last month"
    - Title: "Recent User Registrations"
    
    - User Query: "What are the top selling products by revenue?"
    - Title: "Top Products by Revenue"
    
    - User Query: "Find customers who haven't placed orders recently"
    - Title: "Inactive Customers"
    
    User Query: "${prompt}"
    
    Return ONLY the title, nothing else.
    `;

    const response = await this.openAI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: llmPromptForTitle,
        },
      ],
      max_tokens: 20,
      temperature: 0.3,
    });

    const title = response.choices[0].message?.content?.trim() || 'Untitled Conversation';
    return {
      message: 'Title generated successfully',
      success: true,
      data: title
    }
  }

  // Additional helper methods for better conversation management
  async getConversationsByWorkspace(workspaceId: string, userId: string) {
    try {
      // Verify user owns the workspace
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId, userId: userId }
      });
      
      if (!workspace) {
        throw new NotFoundException('Workspace not found or access denied');
      }

      const conversations = await this.prisma.conversation.findMany({
        where: { workspaceId: workspaceId },
        orderBy: { id: 'desc' },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: {
              prompt: true,
              role: true,
              createdAt: true
            }
          }
        }
      });

      return new ResponseHandler('Conversations retrieved successfully', 200, true, conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch conversations');
    }
  }

  async getMessages(conversationId: string, userId: string) {
    try {
      // Get conversation and verify user access
      const conversation = await this.prisma.conversation.findFirst({
        where: { 
          id: conversationId,
          userId: userId 
        },
        include: { 
          messages: {
            orderBy: { messageId: 'asc' },
            select: {
              id: true,
              prompt: true,
              role: true,
              sqlQuery: true,
              queryResult: true,
              createdAt: true,
              messageId: true
            }
          }
        }
      });

      if (!conversation) {
        throw new NotFoundException('Conversation not found or access denied');
      }

      return new ResponseHandler('Messages retrieved successfully', 200, true, conversation.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch messages');
    }
  }

  async deleteConversation(conversationId: string, userId: string) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Verify ownership
        const conversation = await tx.conversation.findFirst({
          where: { 
            id: conversationId,
            userId: userId 
          }
        });

        if (!conversation) {
          throw new NotFoundException('Conversation not found or access denied');
        }

        // Delete messages first (due to foreign key constraints)
        await tx.messages.deleteMany({
          where: { conversationId: conversationId }
        });

        // Delete conversation
        await tx.conversation.delete({
          where: { id: conversationId }
        });

        return new ResponseHandler('Conversation deleted successfully', 200, true, null);
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete conversation');
    }
  }

}
