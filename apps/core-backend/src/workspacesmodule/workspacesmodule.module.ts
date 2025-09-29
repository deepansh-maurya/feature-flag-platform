import { Module } from '@nestjs/common';
import { WorkspacesmoduleController } from './interface/workspacesmodule.controller';
import { WorkspacesmoduleRepoToken } from './application/ports/workspacesmodule.repo';
import { PrismaWorkspacesmoduleRepo } from './infrastructure/prisma/prisma-workspacesmodule.repo';
import { WorkspacesmoduleService } from './application/use-cases/workspacesmodule.service';
import PrismaService from 'src/infra/prisma/prisma.service';

@Module({
  controllers: [WorkspacesmoduleController],
  providers: [
    PrismaService,
    WorkspacesmoduleService,
    PrismaWorkspacesmoduleRepo,
    {
      provide: WorkspacesmoduleRepoToken,
      useClass: PrismaWorkspacesmoduleRepo,
    },
  ],
  exports: [WorkspacesmoduleService, PrismaWorkspacesmoduleRepo],
})
export class WorkspacesmoduleModule {}
