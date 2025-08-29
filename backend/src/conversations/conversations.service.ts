import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { ResponseHandler } from 'src/common/utils/response-handler.utils';
import { DBType } from 'src/common/enums/DBtype.enum';
import { Client as PgClient } from "pg";
import mysql from "mysql2/promise";
import { MongoClient } from "mongodb";
import { Response } from 'express';
import { Observable } from 'rxjs';
import { CreateMessageStreamDto } from './dto/create-message-stream.dto';


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
    if (schemas) {
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
          messageId : 0,
          prompt,    
          userId
        }
      })

      return new ResponseHandler('Conversation created successfully', 201, true, {
        conversationId: createConversation.id,
        title : createConversation.title,
        prompt : createUserMessage.prompt
      });

    }

    throw new NotFoundException('Database schema not found Please add the schema in database connection');
  }

  async createMessageStream(createMessageStream : CreateMessageStreamDto, userId : string) : Observable<any> {
    const { conversationId, prompt } = createMessageStream;

    // first find the conversations and the workspace schema 
    const findConversation = await this.prisma.conversation.findUnique({
      where : { id : conversationId },
    })
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
    console.log(schema)
    const detailedPrompt = `
    You are an expert SQL query generator.  
    Your job is to take a natural language request from the user and generate a correct, executable SQL query. 
    Understand the user's intent and the context provided by the schema.
    Here is the Question of the User
    Question : ${prompt}

    ### Context:
    - You will be given a database schema. Use it as the single source of truth.  
    - Do not make up tables or columns that are not in the schema.  
    - Always respect table names, column names, and data types exactly as provided.  

    ### Rules:
    1. The query must be valid SQL and executable in PostgreSQL.  
    2. Always include the full SELECT clause instead of SELECT *, unless the user explicitly requests all columns.  
    3. If the user query is ambiguous, pick the most logical interpretation based on the schema.
    4. If the user request cannot be solved with the given schema, return a safe error message instead of inventing tables.  
    5. When filtering, use proper operators (=, ILIKE, IN, etc.) depending on context.  
    6. Use ORDER BY or LIMIT only if requested or clearly implied.  
    7. Format the SQL query with proper indentation for readability.  

    ### Input You Will Receive:
    - Natural language prompt: a plain English question or request.  
    - Database Schema:  
    ${schema}

    ### Output You Must Provide:
    - A single executable SQL query.  
    - The query should be clean, readable, and ready to run.  

    Example:  
    User Prompt: Get all users who registered in the last 7 days  
    Output:  
    {
      "query": "SELECT id, name, email, created_at FROM \"User\" WHERE created_at >= NOW() - INTERVAL '7 days'"
    }

    CRITICAL REQUIREMENTS:
    - Return ONLY the SQL query in the "query" field
    - NO comments, assumptions, or explanations in the SQL
    - NO text before or after the SQL query
    - The query field must contain pure, executable SQL only
    - Do not add any -- comments or explanatory text
    `;

    const response = await this.openAI.chat.completions.create({
      model: 'gpt-4o-mini', // or gpt-4o
      messages: [
        {
          role: 'user',
          content: detailedPrompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: "query_schema",
          schema: {
            type: "object",
            properties: {
              query: {
                type: "string"
              }
            },
            required: ["query"],
            additionalProperties: false
          }
        }
      }
    });
    console.log('OpenAI response:', response.choices[0].message?.content);
    const responseContent = JSON.parse(response.choices[0].message?.content || '{}');
    const sqlQuery = responseContent.query;
    return new ResponseHandler('SQL Query generated successfully', 200, true, sqlQuery);
  }

  private async executeSQLQuery(sqlQuery: string, dbType: DBType, connectionString: string) {
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

  private async getLLMResponse(prompt: string, queryResults: any, userId: string, conversationId: string): Promise<Observable<string>> {
    const llmPrompt = `
    ${this.systemPrompt}
    Here is the SQL Query Results: ${JSON.stringify(queryResults)}
    User's Question: ${prompt}
  `;

    return new Observable((subscriber) => {
      let fullResponse = '';

      (async () => {
        try {
          const chatResponse = await this.openAI.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: llmPrompt }],
            max_tokens: 1024,
            temperature: 0.2,
            stream: true,
          });

          for await (const chunk of chatResponse) {
            const delta = chunk.choices[0]?.delta?.content || '';
            if (delta) {
              fullResponse += delta;
              subscriber.next(delta); // stream to client
            }
          }

          // After the full response is generated, save it to the database
          await this.prisma.messages.create({
            data: {
              conversationId,
              role: 'assistant',
              messageId: 1,
              queryResult: JSON.stringify(queryResults),
              prompt: fullResponse,
              userId
            }
          });

          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      })();

      // Optionally, return a teardown logic if needed
      return () => {};
    });
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

}
