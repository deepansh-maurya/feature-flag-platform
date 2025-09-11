import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { BillingmoduleService } from '../application/use-cases/billingmodule.service';
import { JwtAuthGuard } from 'src/authmodule/infrastructure/guards/jwt-auth.guard';
import { BillingCycle, PlanKey } from '@prisma/client';
import { ResumeDto } from '../application/ports/billingmodule.repo';

@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingmoduleController {
  constructor(private readonly svc: BillingmoduleService) {}

  @Get(':workspaceId')
  async getSubscription(@Param('workspaceId') workspaceId: string) {
    return this.svc.getSubscription(workspaceId);
  }

  @Post('start-checkout')
  async startCheckout(
    @Body()
    body: {
      workspaceId: string;
      planKey: PlanKey;
      cycle: BillingCycle;
    },
  ) {
    return this.svc.startCheckout(body.workspaceId, body.planKey, body.cycle);
  }

  @Patch('change-plan')
  async changePlan(
    @Param('workspaceId') workspaceId: string,
    @Body() body: { planKey: PlanKey; cycle: BillingCycle },
  ) {
    return this.svc.changePlan(workspaceId, body.planKey, body.cycle);
  }

  @Delete(':cancelParam/cancel')
  async cancelSubscription(
    @Param('workspaceId') workspaceId: string,
    @Param('cancelParam') cancel: boolean,
  ) {
    return this.svc.cancelSubscription(workspaceId, cancel);
  }

  @Post('resume')
  async resumeSubscription(@Param('workspaceId') ResumeDto: ResumeDto) {
    return this.svc.resumeSubscription(ResumeDto);
  }
}



