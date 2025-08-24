import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { JwtAuthGuard } from 'src/jwt-auth/jwt.guard';
import type { Request } from 'express';

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post('create')
  create(@Body() createWorkspaceDto: CreateWorkspaceDto, @Req() req: Request) {
    const userId = req['user'].id;
    return this.workspaceService.create(createWorkspaceDto, userId);
  }

  @Get()
  findAll() {
    return this.workspaceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = req['user'].id;
    return this.workspaceService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkspaceDto: UpdateWorkspaceDto, @Req() req: Request) {
    const userId = req['user'].id;
    return this.workspaceService.update(id, userId, updateWorkspaceDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string, @Req() req: Request) {
  //   const userId = req['user'].id;
  //   return this.workspaceService.remove(id, userId);
  // }
}
