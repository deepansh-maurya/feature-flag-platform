import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Delete,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FlagsmoduleService } from '../application/use-cases/flagsmodule.service';
import {
  CreateFlagDto,
  CreateFlagRequestDto,
} from './dto/create-flagsmodule.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/authmodule/infrastructure/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('flagsmodule')
export class FlagsmoduleController {
  constructor(private readonly svc: FlagsmoduleService) {}

  // ------------------- Queries -------------------

  @Get('project/:projectId')
  async listByProject(@Param('projectId') projectId: string) {
    const flags = await this.svc.listByProject(projectId);
    console.log(flags);

    return flags;
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.getById(id);
  }

  @Get('by-key/:projectId/:key')
  async getByKey(
    @Param('projectId') projectId: string,
    @Param('key') key: string,
  ) {
    return this.svc.getByKey(projectId, key);
  }

  @Get('key-available')
  async isKeyAvailable(
    @Query('projectId') projectId: string,
    @Query('key') key: string,
  ) {
    return { available: await this.svc.isKeyAvailable(projectId, key) };
  }

  // ------------------- Mutations -------------------

  @Post()
  async createFlag(@Body() dto: CreateFlagRequestDto, @Req() req: Request) {
    const user = (req.user || {}) as any;
    const workspaceId = user.workspaceId as string | undefined;
    const payload: CreateFlagDto = {
      ...(dto as any),
      workspaceId: workspaceId as string,
    };
    return this.svc.createFlag(payload);
  }

  @Patch(':flagId/archive')
  @HttpCode(204)
  async archive(@Param('flagId', new ParseUUIDPipe()) flagId: string) {
    await this.svc.archive(flagId);
  }

  @Patch(':flagId')
  @HttpCode(204)
  async updateFlag(
    @Param('flagId', new ParseUUIDPipe()) flagId: string,
    @Body() dto: any,
  ) {
    // simple pass-through; validation happens in service/repo
   return await this.svc.updateFlag(flagId, dto);
  }

  @Delete(':flagId')
  @HttpCode(204)
  async delete(@Param('flagId', new ParseUUIDPipe()) flagId: string) {
    return await this.svc.deleteFlag(flagId);
  }
}
