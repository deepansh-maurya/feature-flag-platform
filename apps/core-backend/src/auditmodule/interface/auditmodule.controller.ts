// src/auditmodule/interface/auditmodule.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuditModuleService } from '../application/use-cases/auditmodule.service';
import {
  AppendAuditLogDto,
  ListAuditLogsDto,
} from './dto/create-auditmodule.dto';

@Controller('audit')
export class AuditModuleController {
  constructor(private readonly svc: AuditModuleService) {}

  // fire-and-forget append
  @Post()
  async append(@Body() dto: AppendAuditLogDto) {
    await this.svc.append(dto);
    return { ok: true };
  }

  // list for the UI
  @Get()
  async list(@Query() q: ListAuditLogsDto) {
    return this.svc.list(q);
  }

  // view details
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.svc.getById(id);
  }

  // export CSV (button in the UI)
  @Get('export/csv')
  async exportCsv(@Query() q: ListAuditLogsDto, @Res() res: Response) {
    const csv = await this.svc.exportCsv(q);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="audit-logs.csv"',
    );
    res.send(csv);
  }
}
