import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Client as PgClient } from "pg";
import mysql from "mysql2/promise";
import { MongoClient } from "mongodb";
import { Dbtype } from 'generated/prisma';
import { DBType } from 'src/common/enums/DBtype.enum';
import { ResponseHandler } from 'src/common/utils/response-handler.utils';

@Injectable()
export class WorkspaceService {
	constructor(private readonly prisma: PrismaService) { }
	async create(createWorkspaceDto: CreateWorkspaceDto, userId: string) {
		// start the transaction		// first of all we will fetch all the database schemas
		const { name, description, databaseUrl } = createWorkspaceDto;
		// const validateUrl = this.validateDatabaseUrl(databaseUrl, createWorkspaceDto.dbType);
		// if (!validateUrl) throw new BadRequestException('Invalid database URL');

		// now we will try to connect to the database
		const connectToDB = await this.getDBConnection(databaseUrl, createWorkspaceDto.dbType);
		if (!connectToDB) throw new BadRequestException('Failed to connect to database');

		// if we reach here, it means we have a valid connection
		// now we can fetch the schemas
		const schemas = await this.fetchDatabaseSchemas(connectToDB, createWorkspaceDto.dbType);
		if (!schemas || schemas.length === 0) throw new BadRequestException('Failed to fetch database schemas');
		const newWorkSpace = await this.prisma.workspace.create({
			data : {
				name,
				description,
				userId
			}
		})

		console.log('New workspace created:', newWorkSpace);
		// after creating the workspace create the DbConnection
		const dbConnection = await this.prisma.databaseConnection.create({
			data: {
				workspaceId: newWorkSpace.id,
				schema: schemas
			}
		})

		return new ResponseHandler('Workspace created successfully', 201, true, newWorkSpace);
	}

	async findAll(userId: string) {
		const workspaces = await this.prisma.workspace.findMany({
			where: { userId: userId },
			orderBy: { createdAt: 'desc' }
		});

		return new ResponseHandler('Workspaces fetched successfully', 200, true, workspaces);
	}

	async findOne(id: string, userId: string) {
		const getWorkSpaceDetails = await this.prisma.workspace.findUnique({
			where: { userId: userId, id: id },
		})

		if (!getWorkSpaceDetails) throw new BadRequestException('Workspace not found');

		return new ResponseHandler('Workspace fetched successfully', 200, true, getWorkSpaceDetails);
	}

	update(id: string, userId: string, updateWorkspaceDto: UpdateWorkspaceDto) {
		return `This action updates a #${id} workspace`;
	}

	remove(id: number) {
		return `This action removes a #${id} workspace`;
	}

	private validateDatabaseUrl(
		databaseUrl: string,
		dbType: 'postgres' | 'mysql' | 'mongodb',
	): boolean {
		const regexMap: Record<typeof dbType, RegExp> = {
			postgres: /^postgres:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^?]+/,
			mysql: /^mysql:\/\/[^:]+:[^@]+@[^:]+:\d+\/[^/?]+/,
			mongodb: /^mongodb(\+srv)?:\/\/[^:]+:[^@]+@[^/]+\/[^?]+/,
		};

		const regex = regexMap[dbType];
		return regex.test(databaseUrl);
	}

	private async getDBConnection(databaseUrl: string, dbType: DBType): Promise<any> {
		switch (dbType) {
			case DBType.POSTGRES: {
				const client = new PgClient({ connectionString: databaseUrl });
				await client.connect();
				return client;
			}
			case DBType.MYSQL: {
				const connection = await mysql.createConnection(databaseUrl);
				return connection;
			}
			case DBType.MONGODB: {
				const client = new MongoClient(databaseUrl);
				await client.connect();
				return client.db(); // return db handle
			}
			default:
				throw new Error(`Unsupported database type: ${dbType}`);
		}
	}

	private async fetchDatabaseSchemas(connection: any, dbType: DBType): Promise<string[]> {
		switch (dbType) {
			case DBType.POSTGRES: {
				const result = await connection.query(`
						SELECT 
   					table_name, 
    					column_name, 
    					data_type, 
    					is_nullable, 	
    					character_maximum_length
						FROM information_schema.columns
						WHERE table_schema = 'public'
						ORDER BY table_name, ordinal_position;`);
				// Create a structured object for the schema
				return result.rows.map(row => ({
					[row.table_name]: [{
						columnName: row.column_name,
						dataType: row.data_type,
						isNullable: row.is_nullable,
						characterMaximumLength: row.character_maximum_length
					}]
				}));
			}
			case DBType.MYSQL: {
				const [rows] = await connection.query("SHOW DATABASES");
				return rows.map((row: any) => row.Database);
			}
			case DBType.MONGODB: {
				return connection.listCollections().toArray().then((collections: any) => collections.map((col: any) => col.name));
			}
			default:
				throw new Error(`Unsupported database type: ${dbType}`);
		}
	}

}
