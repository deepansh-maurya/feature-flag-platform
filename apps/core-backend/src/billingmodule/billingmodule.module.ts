import { Module } from '@nestjs/common';
import { AuditModuleService } from 'src/auditmodule/application/use-cases/auditmodule.service';
import PrismaService from 'src/infra/prisma/prisma.service';
import { BillingmoduleController } from './interface/billingmodule.controller';
import RazorpayBillingModuleRepo from './infrastructure/prisma/prisma-billingmodule.repo';
import { BillingmoduleService } from './application/use-cases/billingmodule.service';

@Module({
  controllers: [BillingmoduleController],
  providers: [
    PrismaService,
    { provide: 'AuditModuleRepo', useClass: RazorpayBillingModuleRepo },
    { provide: AuditModuleService, useFactory: (repo: RazorpayBillingModuleRepo) => new BillingmoduleService(repo), inject: ['AuditModuleRepo'] },
  ],
  exports: [AuditModuleService],
})
export class AuditModule {}
