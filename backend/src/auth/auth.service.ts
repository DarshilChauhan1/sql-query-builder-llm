import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { ResponseHandler } from 'src/common/utils/response-handler.utils';
import { VerifyEmailDto } from './dto/verify-email.dto';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtAuthService,
  ) {}
  
  async create(createAuthDto: CreateAuthDto) {
    // first of check if the user exists or not with the same email
    const user = await this.prisma.user.findUnique({
      where: { email: createAuthDto.email },
    });

    if (user) {
      throw new BadRequestException('User already exists');
    }

    // if the user is new we will send an email verification code
    const generateOtp = this.generateEmailVerificationCode(6);
    const getHashAndExpiry = await this.generateHashAndOtpExpiry(generateOtp, createAuthDto.email);

    // Send the email with the verification code
    await this.mailService.sendVerificationEmail(createAuthDto.email, generateOtp);
    return new ResponseHandler('Verification email sent please verify to continue', 200, true, {
      email: createAuthDto.email,
      hash: getHashAndExpiry.hash,
      otpExpiry : getHashAndExpiry.setExpiryOfUser
    });

  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, otp, hash, otpExpiry, name, password} = verifyEmailDto;

    // Verify the OTP and hash
    const isValid = await this.validateOtp(email, otp, hash, otpExpiry);
    if (!isValid) {
      throw new BadRequestException('Invalid OTP or Your otp has expired');
    }

    // encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // if the otp is vaid we will create the new user
    const newUser = await this.prisma.user.create({
      data: {
        email,
        password : hashedPassword,
        name : name
      },
    });

    const userDetails = {
      email: newUser.email,
      name: newUser.name,
    };

    const tokens = await this.jwtService.generateTokens({ email: newUser.email, id: newUser.id });

    return new ResponseHandler('User created successfully', 201, true, {
      user: userDetails,
      tokens 
    });
  }

  async login(payload : LoginAuthDto) {
    const { email, password } = payload;
    const existUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!existUser) {
      throw new BadRequestException('User does not exist');
    }

    const isPasswordValid = await bcrypt.compare(password, existUser.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password');
    }

    const tokens = await this.jwtService.generateTokens({ email: existUser.email, id: existUser.id });
    return new ResponseHandler('Login successful', 200, true, {
      user: {
        email: existUser.email,
        name: existUser.name,
      },
      tokens
    });
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private generateEmailVerificationCode(length: number) {
    const code = Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)).toString();
    return code;
  }

  private async generateHashAndOtpExpiry(otp: string, email: string) {
    const secret = this.configService.get<string>('OTP_SECRET') as string;
    const getExpiryTime = this.configService.get<number>('OTP_EXPIRY_TIME') as number; // in minutes
    const setExpiryOfUser = Date.now() + getExpiryTime * 60 * 1000;
    const data = `${otp}${email}${setExpiryOfUser}`;
    const hash = await crypto.createHmac('sha256', secret).update(data).digest('hex');
    return { hash, setExpiryOfUser };
  }

  private async validateOtp(email: string, otp : string, hash: string, otpExpiry: string) {
    const secret = this.configService.get<string>('OTP_SECRET') as string;
    const data = `${otp}${email}${otpExpiry}`;
    const calculatedHash = await crypto.createHmac('sha256', secret).update(data).digest('hex');
    return calculatedHash === hash;
  }

}
