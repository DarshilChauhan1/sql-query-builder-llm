import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateMessageStreamDto {
    @IsNotEmpty()
    @IsUUID()
    conversationId: string;

    @IsNotEmpty()
    @IsString()
    prompt: string;
}