import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NotificationsmoduleService } from '../application/notificationsmodule.service';

@Controller('notificationsmodule')
export class NotificationsmoduleController {
  constructor(private readonly svc: NotificationsmoduleService) {}

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

