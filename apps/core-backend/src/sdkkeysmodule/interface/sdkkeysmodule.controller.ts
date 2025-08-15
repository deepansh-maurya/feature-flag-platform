import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SdkkeysmoduleService } from '../application/sdkkeysmodule.service';

@Controller('sdkkeysmodule')
export class SdkkeysmoduleController {
  constructor(private readonly svc: SdkkeysmoduleService) {}

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

