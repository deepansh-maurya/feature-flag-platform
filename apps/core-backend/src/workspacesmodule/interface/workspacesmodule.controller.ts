import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WorkspacesmoduleService } from '../application/workspacesmodule.service';

@Controller('workspacesmodule')
export class WorkspacesmoduleController {
  constructor(private readonly svc: WorkspacesmoduleService) {}

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

