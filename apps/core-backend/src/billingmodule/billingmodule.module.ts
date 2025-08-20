import { Module } from '@nestjs/common';
import { BillingmoduleRepoToken } from './application/ports/billingmodule.repo';
import PrismaBillingModuleRepo from './infrastructure/prisma/prisma-billingmodule.repo';
import { StripeWebhookController } from './interface/stripe-webhook.controller';
import { BillingmoduleService } from './application/use-cases/billingmodule.service';
import PrismaService from 'src/infra/prisma/prisma.service';

@Module({
  controllers: [StripeWebhookController],
  providers: [
    PrismaService,
    BillingmoduleService,
    { provide: BillingmoduleRepoToken, useClass: PrismaBillingModuleRepo },
  ],
  exports: [BillingmoduleService],
})
export class BillingmoduleModule { }

