import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, ConfigService, MailService],
})
export class AuthModule {}
