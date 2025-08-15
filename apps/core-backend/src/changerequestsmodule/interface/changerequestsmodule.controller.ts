import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChangerequestsmoduleService } from '../application/changerequestsmodule.service';

@Controller('changerequestsmodule')
export class ChangerequestsmoduleController {
  constructor(private readonly svc: ChangerequestsmoduleService) {}

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

