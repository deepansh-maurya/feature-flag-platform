import { Module } from '@nestjs/common';
import { HealthmoduleController } from './interface/healthmodule.controller';
import { HealthmoduleService } from './application/healthmodule.service';
import { HealthmoduleRepoToken } from './application/ports/healthmodule.repo';
import { PrismaHealthmoduleRepo } from './infrastructure/prisma/prisma-healthmodule.repo';

@Module({
  controllers: [HealthmoduleController],
  providers: [
    HealthmoduleService,
    { provide: HealthmoduleRepoToken, useClass: PrismaHealthmoduleRepo },
  ],
  exports: [HealthmoduleService],
})
export class HealthmoduleModule {}

