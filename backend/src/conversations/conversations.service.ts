import { Injectable, NotFoundException } from '@nestjs/common';
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
  async create(createConversationDto: CreateConversationDto, userId: string) {
    const { workspaceId, prompt } = createConversationDto;
    const getWorkSpaceDetails = await this.prisma.workspace.findUnique({
      where: { id: workspaceId, userId: userId },
      include: { databaseConnection: true }
    })
    if (!getWorkSpaceDetails) throw new NotFoundException('Workspace not found');
    // get the schemas for the DB connections
    const schemas = getWorkSpaceDetails.databaseConnection?.schema;
    if (schemas) {
      // Do something with the schemas
      const generateQuery = await this.generateSQLQuery(prompt, JSON.stringify(schemas));
      if (!generateQuery.success) throw new NotFoundException('Failed to generate SQL query');
      const sqlQuery = generateQuery.data;
      const queryResults = await this.executeSQLQuery(sqlQuery, getWorkSpaceDetails.databaseConnection?.dbType as any, getWorkSpaceDetails.databaseConnection?.connectionString as any);
      console.log('Query Results:', queryResults);
    }
    return new ResponseHandler('Conversation created successfully', 201, true, {});
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

    return queryResults;
  }
}
