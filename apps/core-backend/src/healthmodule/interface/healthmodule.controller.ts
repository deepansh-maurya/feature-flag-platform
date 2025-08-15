import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { HealthmoduleService } from '../application/healthmodule.service';

@Controller('healthmodule')
export class HealthmoduleController {
  constructor(private readonly svc: HealthmoduleService) {}

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

