import { Module } from '@nestjs/common';
import { ProjectmoduleController } from './interface/projectmodule.controller';
import { ProjectmoduleService } from './application/projectmodule.service';
import { ProjectmoduleRepoToken } from './application/ports/projectmodule.repo';
import { PrismaProjectmoduleRepo } from './infrastructure/prisma/prisma-projectmodule.repo';

@Module({
  controllers: [ProjectmoduleController],
  providers: [
    ProjectmoduleService,
    { provide: ProjectmoduleRepoToken, useClass: PrismaProjectmoduleRepo },
  ],
  exports: [ProjectmoduleService],
})
export class ProjectmoduleModule {}

