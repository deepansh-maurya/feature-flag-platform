import { Module } from '@nestjs/common';
import { AuditModuleController } from './interface/auditmodule.controller';
import { AuditModuleService } from './application/use-cases/auditmodule.service';
import { PrismaAuditModuleRepo } from './infrastructure/prisma/prisma-auditmodule.repo';
import { AuditmoduleRepoToken } from './application/ports/auditmodule.repo';
import PrismaService from 'src/infra/prisma/prisma.service';

@Module({
  controllers: [AuditModuleController],
  providers: [
    PrismaService,
    AuditModuleService,
    { provide: AuditmoduleRepoToken, useClass: PrismaAuditModuleRepo },
  ],
  exports: [AuditModuleService],
})
export class Auditmodule {} 