import { Module } from '@nestjs/common';
import { FlagsmoduleController } from './interface/flagsmodule.controller';
import { FlagsmoduleService } from './application/flagsmodule.service';
import { FlagsmoduleRepoToken } from './application/ports/flagsmodule.repo';
import { PrismaFlagsmoduleRepo } from './infrastructure/prisma/prisma-flagsmodule.repo';

@Module({
  controllers: [FlagsmoduleController],
  providers: [
    FlagsmoduleService,
    { provide: FlagsmoduleRepoToken, useClass: PrismaFlagsmoduleRepo },
  ],
  exports: [FlagsmoduleService],
})
export class FlagsmoduleModule {}

