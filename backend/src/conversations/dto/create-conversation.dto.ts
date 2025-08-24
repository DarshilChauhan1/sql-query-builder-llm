import { IsNotEmpty, IsSemVer, IsString } from "class-validator";

export class CreateConversationDto {
    @IsNotEmpty()
    @IsString()
    workspaceId: string;

    @IsString()
    @IsNotEmpty()
    prompt : string;

}
