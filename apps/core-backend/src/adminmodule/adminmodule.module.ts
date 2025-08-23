import { Module } from '@nestjs/common';
import { AuditController } from './interface/adminmodule.controller';
import { AuditService } from './application/use-cases/adminmodule.service';
import { AuditRepoToken } from './application/ports/adminmodule.repo';
import { PrismaAuditRepo } from './infrastructure/prisma/prisma-adminmodule.repo';

@Module({
  controllers: [AuditController],
  providers: [
    AuditService,
    { provide: AuditRepoToken, useClass: PrismaAuditRepo },
  ],
  exports: [AuditService],
})
export class AuditModule {}
