import { Module } from '@nestjs/common';
import { ProjectmoduleController } from './interface/projectmodule.controller';
import { ProjectmoduleRepoToken } from './application/ports/projectmodule.repo';
import { PrismaProjectmoduleRepo } from './infrastructure/prisma/prisma-projectmodule.repo';
import { ProjectmoduleService } from './application/use-cases/projectmodule.service';

@Module({
  controllers: [ProjectmoduleController],
  providers: [
    ProjectmoduleService,
    { provide: ProjectmoduleRepoToken, useClass: PrismaProjectmoduleRepo },
  ],
  exports: [ProjectmoduleService],
})
export class ProjectmoduleModule {}

