import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersmoduleService } from '../application/usersmodule.service';

@Controller('usersmodule')
export class UsersmoduleController {
  constructor(private readonly svc: UsersmoduleService) {}

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

