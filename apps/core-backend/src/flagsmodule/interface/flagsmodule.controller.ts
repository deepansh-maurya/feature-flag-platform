import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FlagsmoduleService } from '../application/flagsmodule.service';

@Controller('flagsmodule')
export class FlagsmoduleController {
  constructor(private readonly svc: FlagsmoduleService) {}

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

