import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthmoduleService } from '../application/authmodule.service';

@Controller('authmodule')
export class AuthmoduleController {
  constructor(private readonly svc: AuthmoduleService) {}

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

