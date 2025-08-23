import { IsNotEmpty, IsEmail, IsString, IsStrongPassword } from "class-validator";

export class VerifyEmailDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })
    password: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    otp: string;

    @IsNotEmpty()
    @IsString()
    hash: string;

    @IsNotEmpty()
    @IsString()
    otpExpiry: string;
}
