import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Dbtype } from "generated/prisma";
import { DBType } from "src/common/enums/DBtype.enum";

export class ValidateSchemaDto {
    @IsString()
    @IsNotEmpty()
    databaseUrl: string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(DBType)
    dbType: DBType;
}