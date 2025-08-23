import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthService } from './jwt-auth.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtAuthService],
  exports: [JwtAuthService],
})
export class JwtAuthModule {}