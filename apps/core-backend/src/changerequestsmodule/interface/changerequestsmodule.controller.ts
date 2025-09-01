import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChangeRequestService } from '../application/use-cases/changerequestsmodule.service';
import {
  ApproveChangeRequestDto,
  CreateChangeRequestDto,
  GetByFlagEnvDto,
  MarkAppliedChangeRequestDto,
  RejectChangeRequestDto,
} from './dto/create-changerequestsmodule.dto';
import { JwtAuthGuard } from 'src/authmodule/infrastructure/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)  
@Controller('change-requests')
export class ChangeRequestController {
  constructor(private readonly svc: ChangeRequestService) {}

  @Post()
  create(@Body() dto: CreateChangeRequestDto) {
    return this.svc.create(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.svc.getById(id);
  }

  @Get()
  listByFlagEnv(@Query() q: GetByFlagEnvDto) {
    return this.svc.listByFlagEnv(q);
  }

  @Get('open/:flagId/:envKey')
  listOpenByEnv(@Param('flagId') flagId: string, @Param('envKey') envKey: string) {
    return this.svc.listOpenByEnv(flagId, envKey);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() body: Omit<ApproveChangeRequestDto, 'id'>) {
    const dto: ApproveChangeRequestDto = { id, ...body };
    return this.svc.approve(dto);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() body: Omit<RejectChangeRequestDto, 'id'>) {
    const dto: RejectChangeRequestDto = { id, ...body };
    return this.svc.reject(dto);
  }

  @Post(':id/applied')
  markApplied(@Param('id') id: string) {
    const dto: MarkAppliedChangeRequestDto = { id };
    return this.svc.markApplied(dto);
  }
}
