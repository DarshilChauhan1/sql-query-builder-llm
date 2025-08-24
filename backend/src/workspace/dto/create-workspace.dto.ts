import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { DBType } from "src/common/enums/DBtype.enum";

export class CreateWorkspaceDto {
    @IsNotEmpty()
    @IsString()
    name : string;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    description?: string;

    @IsNotEmpty()
    @IsString()
    databaseUrl : string;

    @IsString()
    @IsNotEmpty()
    @IsEnum(DBType)
    dbType: DBType
}
    