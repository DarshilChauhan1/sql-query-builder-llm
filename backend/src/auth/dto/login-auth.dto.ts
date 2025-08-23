import { IsNotEmpty, IsEmail, IsString } from "class-validator";

export class LoginAuthDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}