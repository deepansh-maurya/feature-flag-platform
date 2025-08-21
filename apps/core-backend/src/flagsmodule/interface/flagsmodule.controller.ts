// apps/core-backend/src/flagsmodule/interface/flagsmodule.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { FlagsmoduleService } from '../application/use-cases/flagsmodule.service';
import { CreateFlagDto, CreateVersionDto, UpsertFlagMetaDto } from './dto/create-flagsmodule.dto';

@Controller('flagsmodule')
export class FlagsmoduleController {
  constructor(private readonly svc: FlagsmoduleService) {}

  // ------------------- Queries -------------------

  @Get('project/:projectId')
  async listByProject(@Param('projectId') projectId: string) {
    return this.svc.listByProject(projectId);
  }

  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.svc.getById(id);
  }

  @Get('by-key/:projectId/:key')
  async getByKey(@Param('projectId') projectId: string, @Param('key') key: string) {
    return this.svc.getByKey(projectId, key);
  }

  @Get('key-available')
  async isKeyAvailable(@Query('projectId') projectId: string, @Query('key') key: string) {
    return { available: await this.svc.isKeyAvailable(projectId, key) };
  }

  // ------------------- Mutations -------------------

  @Post()
  async createFlag(@Body() dto: CreateFlagDto) {
    return this.svc.createFlag(dto);
  }

  // You can pass flagId inside body (CreateVersionDto) or via param. Here I support both.
  @Post(':flagId/versions')
  async createVersion(
    @Param('flagId', new ParseUUIDPipe()) flagId: string,
    @Body() dto: CreateVersionDto,
  ) {
    // prefer URL param as source of truth
    dto.flagId = flagId;
    return this.svc.createVersion(dto);
  }

  @Patch(':flagId/meta')
  async upsertMeta(
    @Param('flagId', new ParseUUIDPipe()) flagId: string,
    @Body() dto: UpsertFlagMetaDto,
  ) {
    dto.flagId = flagId;
    await this.svc.upsertMeta(dto);
    return { ok: true };
  }

  @Patch(':flagId/archive')
  @HttpCode(204)
  async archive(@Param('flagId', new ParseUUIDPipe()) flagId: string) {
    await this.svc.archive(flagId);
  }
}
