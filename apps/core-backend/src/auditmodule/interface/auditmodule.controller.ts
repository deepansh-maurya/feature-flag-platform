import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuditmoduleService } from '../application/auditmodule.service';

@Controller('auditmodule')
export class AuditmoduleController {
  constructor(private readonly svc: AuditmoduleService) {}

  @Get()
  async list() {
    return this.svc.list();
  }

  @Post()
  async create(@Body() dto: any) {
    return this.svc.create(dto);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.get(id);
  }
}

