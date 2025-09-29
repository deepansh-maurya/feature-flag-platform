import { Module } from '@nestjs/common';
import { FlagsmoduleController } from './interface/flagsmodule.controller';
import { FlagsmoduleService } from './application/use-cases/flagsmodule.service';
import { FLAGS_REPO } from './application/ports/flagsmodule.repo';
import { PrismaFlagsRepository } from './infrastructure/prisma/prisma-flagsmodule.repo';
import PrismaService from 'src/infra/prisma/prisma.service';

@Module({
  controllers: [FlagsmoduleController],
  providers: [
    PrismaService,
    FlagsmoduleService,
    { provide: FLAGS_REPO, useClass: PrismaFlagsRepository },
  ],
  exports: [FlagsmoduleService],
})
export class FlagsmoduleModule {}
