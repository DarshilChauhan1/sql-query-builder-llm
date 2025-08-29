import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res, Sse } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt.guard';
import type { Request, Response } from 'express';
import { map, Observable } from 'rxjs';
import { CreateMessageStreamDto } from './dto/create-message-stream.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) { }

  @Post('create')
  create(@Body() createConversationDto: CreateConversationDto, @Req() req: Request) {
    const userId = req['user'].id;
    return this.conversationsService
      .create(createConversationDto, userId) 
  }


  @Sse('chat-stream')
  createMessageStream(@Body() paylaod : CreateMessageStreamDto, @Req() Request : Request): Observable<MessageEvent> {
    const userId = Request['user'].id;
    return this.conversationsService.createMessageStream(paylaod, userId).pipe(
      map((data: string) => ({
        data,
      })),
    );
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
  remove(@Param('id') id: string) {
    return this.conversationsService.remove(+id);
  }
}
