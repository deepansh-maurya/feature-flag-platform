import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AnalyticsmoduleService } from '../application/use-cases/analyticsmodule.service';
import {
  GetFlagMetricsDto,
  GetOverviewDto,
  RecordEvaluationDto,
} from './dto/create-analyticsmodule.dto';

@Controller('analytics')
export class AnalyticsmoduleController {
  constructor(private readonly svc: AnalyticsmoduleService) {}

  // Record flag evaluation (called by SDK backend)
  @Post('record')
  async recordEvaluation(@Body() dto: RecordEvaluationDto) {
    await this.svc.recordEvaluation(dto);
    return { success: true };
  }

  // Overview metrics (all flags, one env, timeframe)
  @Get('overview')
  async getOverview(@Query() dto: GetOverviewDto) {
    return this.svc.getOverview(dto);
  }

  // Per-flag metrics
  @Get('flag-metrics')
  async getFlagMetrics(@Query() dto: GetFlagMetricsDto) {
    return this.svc.getFlagMetrics(dto);
  }
}
