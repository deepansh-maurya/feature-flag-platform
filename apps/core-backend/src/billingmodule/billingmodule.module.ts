import { Module } from '@nestjs/common';
import { AuditModuleService } from 'src/auditmodule/application/use-cases/auditmodule.service';
import { PrismaAuditModuleRepo } from 'src/auditmodule/infrastructure/prisma/prisma-auditmodule.repo';
import { AuditModuleController } from 'src/auditmodule/interface/auditmodule.controller';
import PrismaService from 'src/infra/prisma/prisma.service';

@Module({
  controllers: [AuditModuleController],
  providers: [
    PrismaService,
    { provide: 'AuditModuleRepo', useClass: PrismaAuditModuleRepo },
    { provide: AuditModuleService, useFactory: (repo: PrismaAuditModuleRepo) => new AuditModuleService(repo), inject: ['AuditModuleRepo'] },
  ],
  exports: [AuditModuleService],
})
export class AuditModule {}
