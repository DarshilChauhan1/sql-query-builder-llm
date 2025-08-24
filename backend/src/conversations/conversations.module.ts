import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [ConversationsController],
  providers: [ConversationsService, ConfigService],
})
export class ConversationsModule {}
