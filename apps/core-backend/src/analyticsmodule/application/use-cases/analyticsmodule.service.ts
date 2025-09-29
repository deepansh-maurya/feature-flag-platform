// apps/core-backend/src/analyticsmodule/application/use-cases/analyticsmodule.service.ts

import { Inject, Injectable } from '@nestjs/common';
import { AnalyticsmoduleRepo } from '../ports/analyticsmodule.repo';
import {
  GetFlagMetricsDto,
  GetOverviewDto,
  RecordEvaluationDto,
} from 'src/analyticsmodule/interface/dto/create-analyticsmodule.dto';

export const AnalyticsmoduleRepoToken = Symbol('AnalyticsmoduleRepo');

@Injectable()
export class AnalyticsmoduleService {
  constructor(
    @Inject(AnalyticsmoduleRepoToken)
    private readonly repo: AnalyticsmoduleRepo,
  ) {}

  async recordEvaluation(dto: RecordEvaluationDto): Promise<void> {
    return this.repo.recordEvaluation({
      ...dto,
      evaluatedAt: new Date(dto.evaluatedAt),
    });
  }

  async getOverview(dto: GetOverviewDto) {
    return this.repo.getOverview({
      ...dto,
      from: new Date(dto.from),
      to: new Date(dto.to),
    });
  }

  async getFlagMetrics(dto: GetFlagMetricsDto) {
    return this.repo.getFlagMetrics({
      ...dto,
      from: new Date(dto.from),
      to: new Date(dto.to),
    });
  }
}
