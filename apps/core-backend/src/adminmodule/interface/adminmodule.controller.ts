import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AdminmoduleService } from '../application/adminmodule.service';

@Controller('adminmodule')
export class AdminmoduleController {
  constructor(private readonly svc: AdminmoduleService) {}

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

