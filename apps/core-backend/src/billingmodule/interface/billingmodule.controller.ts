import { Body, Controller, Get, Param, Post, Delete, Patch, UseGuards } from '@nestjs/common';
import { BillingmoduleService } from '../application/use-cases/billingmodule.service';
import { JwtAuthGuard } from 'src/authmodule/infrastructure/guards/jwt-auth.guard';
import { BillingCycle, PlanKey } from 'generated/prisma';

@UseGuards(JwtAuthGuard)   
@Controller('billing')
export class BillingmoduleController {
    constructor(private readonly svc: BillingmoduleService) { }

    @Get(':workspaceId')
    async getSubscription(@Param('workspaceId') workspaceId: string) {
        return this.svc.getSubscription(workspaceId);
    }

    @Post(':workspaceId/start-checkout')
    async startCheckout(
        @Param('workspaceId') workspaceId: string,
        @Body() body: { planKey: PlanKey; cycle: BillingCycle },
    ) {
        return this.svc.startCheckout(workspaceId, body.planKey, body.cycle);
    }

    @Patch(':workspaceId/change-plan')
    async changePlan(
        @Param('workspaceId') workspaceId: string,
        @Body() body: { planKey: PlanKey; cycle: BillingCycle },
    ) {
        return this.svc.changePlan(workspaceId, body.planKey, body.cycle);
    }

    @Delete(':workspaceId/:cancelParam/cancel')
    async cancelSubscription(@Param('workspaceId') workspaceId: string, @Param('cancelParam') cancel: boolean) {
        return this.svc.cancelSubscription(workspaceId, cancel);
    }

    @Post(':workspaceId/resume')
    async resumeSubscription(@Param('workspaceId') workspaceId: string) {
        return this.svc.resumeSubscription(workspaceId);
    }
}
