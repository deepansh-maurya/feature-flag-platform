import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WebhooksmoduleService } from '../application/webhooksmodule.service';

@Controller('webhooksmodule')
export class WebhooksmoduleController {
  constructor(private readonly svc: WebhooksmoduleService) {}

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

