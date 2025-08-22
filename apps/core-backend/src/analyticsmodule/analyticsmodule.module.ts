import { Module } from '@nestjs/common';
import { AnalyticsmoduleController } from './interface/analyticsmodule.controller';
import { PrismaAnalyticsmoduleRepo } from './infrastructure/prisma/prisma-analyticsmodule.repo';
import { AnalyticsmoduleRepoToken, AnalyticsmoduleService } from './application/use-cases/analyticsmodule.service';

@Module({
  controllers: [AnalyticsmoduleController],
  providers: [
    AnalyticsmoduleService,
    { provide: AnalyticsmoduleRepoToken, useClass: PrismaAnalyticsmoduleRepo },
  ],
  exports: [AnalyticsmoduleService],
})
export class AnalyticsmoduleModule {}

