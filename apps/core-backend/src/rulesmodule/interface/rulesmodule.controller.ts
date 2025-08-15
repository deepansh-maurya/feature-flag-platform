import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RulesmoduleService } from '../application/rulesmodule.service';

@Controller('rulesmodule')
export class RulesmoduleController {
  constructor(private readonly svc: RulesmoduleService) {}

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

