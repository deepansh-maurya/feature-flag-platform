import { Module } from '@nestjs/common';

import PrismaService from 'src/infra/prisma/prisma.service';
import { BillingmoduleController } from './interface/billingmodule.controller';
import RazorpayBillingModuleRepo from './infrastructure/prisma/prisma-billingmodule.repo';
import { BillingmoduleService } from './application/use-cases/billingmodule.service';
import { BillingmoduleRepoToken } from './application/ports/billingmodule.repo';

@Module({
  controllers: [BillingmoduleController],
  providers: [
    PrismaService,
    BillingmoduleService,
    { provide: BillingmoduleRepoToken, useClass: RazorpayBillingModuleRepo },
  ],
  exports: [BillingmoduleService],
})
export class BillingModule {}
