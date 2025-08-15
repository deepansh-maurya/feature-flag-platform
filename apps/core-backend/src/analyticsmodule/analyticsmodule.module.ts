import { Module } from '@nestjs/common';
import { AnalyticsmoduleController } from './interface/analyticsmodule.controller';
import { AnalyticsmoduleService } from './application/analyticsmodule.service';
import { AnalyticsmoduleRepoToken } from './application/ports/analyticsmodule.repo';
import { PrismaAnalyticsmoduleRepo } from './infrastructure/prisma/prisma-analyticsmodule.repo';

@Module({
  controllers: [AnalyticsmoduleController],
  providers: [
    AnalyticsmoduleService,
    { provide: AnalyticsmoduleRepoToken, useClass: PrismaAnalyticsmoduleRepo },
  ],
  exports: [AnalyticsmoduleService],
})
export class AnalyticsmoduleModule {}

