import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res, Sse, MessageEvent, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt.guard';
import type { Request, Response } from 'express';
import { map, Observable, catchError, of } from 'rxjs';
import { CreateMessageStreamDto } from './dto/create-message-stream.dto';
import { StreamEventData, SSEMessageEvent } from './types/stream-events.types';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) { }

  @Post('create')
  create(@Body() createConversationDto: CreateConversationDto, @Req() req: Request) {
    const userId = req['user'].id;
    return this.conversationsService
      .create(createConversationDto, userId)
  }

  @Sse('stream')
  async createMessageStream(
    @Query('conversationId') conversationId: string,
    @Query('prompt') prompt: string,
    @Req() request: Request
  ): Promise<Observable<MessageEvent>> {
    const userId = request['user'].id;
    // Validate required parameters
    if (!conversationId || !prompt) {
      return new Observable<MessageEvent>((subscriber) => {
        subscriber.next({
          data: JSON.stringify({
            type: 'error',
            message: 'Missing required parameters: conversationId and prompt are required'
          }),
          type: 'error',
          id: `${Date.now()}-validation-error`,
          retry: 3000
        } as MessageEvent);
        subscriber.complete();
      });
    }

    try {
      const payload = { conversationId, prompt };
      const stream = await this.conversationsService.createMessageStream(payload, userId);

      return stream.pipe(
        map((data: StreamEventData): MessageEvent => ({
          data: JSON.stringify(data),
          type: data.type,
          id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
          retry: 3000
        } as MessageEvent)),
        catchError((error) => {
          console.error('SSE Stream error:', error);
          return of({
            data: JSON.stringify({
              type: 'error',
              message: error.message || 'An error occurred during streaming'
            }),
            type: 'error',
            id: `${Date.now()}-error`,
            retry: 3000
          } as MessageEvent);
        })
      );
    } catch (error) {
      console.error('SSE Initialization error:', error);
      // Return an observable that emits an error event
      return new Observable<MessageEvent>((subscriber) => {
        subscriber.next({
          data: JSON.stringify({
            type: 'error',
            message: error.message || 'Failed to initialize stream'
          }),
          type: 'error',
          id: `${Date.now()}-init-error`,
          retry: 3000
        } as MessageEvent);
        subscriber.complete();
      });
    }
  }

  @Get('get-conversations/:workspaceId')
  getConversationsByWorkspace(@Param('workspaceId') workspaceId: string, @Req() req: Request) {
    const userId = req['user'].id;
    return this.conversationsService.getConversationsByWorkspace(workspaceId, userId);
  }

  @Get('get-messages/:conversationId')
  getMessages(@Param('conversationId') conversationId: string, @Req() req: Request) {
    const userId = req['user'].id;
    return this.conversationsService.getMessages(conversationId, userId);
  }

  @Get()
  findAll() {
    return this.conversationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConversationDto: UpdateConversationDto) {
    return this.conversationsService.update(+id, updateConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = req['user'].id;
    return this.conversationsService.deleteConversation(id, userId);
  }
}
