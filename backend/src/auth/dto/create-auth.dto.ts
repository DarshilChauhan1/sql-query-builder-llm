import { IsNotEmpty, IsEmail } from "class-validator";

export class CreateAuthDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
}
