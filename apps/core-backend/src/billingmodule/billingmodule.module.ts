import { Module } from '@nestjs/common';
import { BillingmoduleRepoToken } from './application/ports/billingmodule.repo';
import PrismaBillingModuleRepo from './infrastructure/prisma/prisma-billingmodule.repo';
import { StripeWebhookController } from './interface/stripe-webhook.controller';

@Module({
  controllers: [StripeWebhookController],
  providers: [
    { provide: BillingmoduleRepoToken, useClass: PrismaBillingModuleRepo },
  ],
//   exports: [BillingmoduleService],
})
export class BillingmoduleModule {}

