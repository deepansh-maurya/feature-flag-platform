import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DeliverysyncmoduleService } from '../application/deliverysyncmodule.service';

@Controller('deliverysyncmodule')
export class DeliverysyncmoduleController {
  constructor(private readonly svc: DeliverysyncmoduleService) {}

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

