import {
  GetFlagMetricsDto,
  GetOverviewDto,
  RecordEvaluationDto,
} from 'src/analyticsmodule/interface/dto/create-analyticsmodule.dto';

export interface AnalyticsmoduleRepo {
  // Store one evaluation event (flag evaluation happened)
  recordEvaluation(dto: RecordEvaluationDto): Promise<void>;

  // Aggregate: overview metrics (all flags for a workspace/project/env)
  getOverview(dto: GetOverviewDto): Promise<{
    totalEvaluations: number;
    enabledPercentage: number;
    apiRequests: number;
    uniqueUsers: number;
  }>;

  // Per-flag metrics
  getFlagMetrics(dto: GetFlagMetricsDto): Promise<{
    evaluations: number;
    enabledPercentage: number;
    apiRequests: number;
    uniqueUsers: number;
    // variantDistribution: Record<string, number>; // { control: 50, treatment: 50 }
    topRulesMatched: Record<string, number>; // { "geo-IN": 1800, "plan-pro": 1500 }
    trend: { date: string; enabled: number; disabled: number }[];
  }>;
}
