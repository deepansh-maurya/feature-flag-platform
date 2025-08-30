// src/features/analytics/api.ts
import { http } from "@/src/shared/lib/http";
import type {
  RecordEvaluationDto,
  GetOverviewDto,
  GetFlagMetricsDto,
} from "./types";

/** Store one evaluation event (fire-and-forget) */
export async function recordEvaluation(dto: RecordEvaluationDto): Promise<void> {
  await http.post("/api/v1/analytics/evaluations", dto);
}

/** Aggregate overview metrics (workspace/project/env scope) */
export async function getOverview(dto: GetOverviewDto): Promise<{
  totalEvaluations: number;
  enabledPercentage: number;
  apiRequests: number;
  uniqueUsers: number;
}> {
  const { data } = await http.get("/api/v1/analytics/overview", {
    params: dto,
  });
  return data as {
    totalEvaluations: number;
    enabledPercentage: number;
    apiRequests: number;
    uniqueUsers: number;
  };
}

/** Per-flag metrics */
export async function getFlagMetrics(dto: GetFlagMetricsDto): Promise<{
  evaluations: number;
  enabledPercentage: number;
  apiRequests: number;
  uniqueUsers: number;
  variantDistribution: Record<string, number>;
  topRulesMatched: Record<string, number>;
  trend: { date: string; enabled: number; disabled: number }[];
}> {
  const { data } = await http.get("/api/v1/analytics/flags/metrics", {
    params: dto,
  });
  return data as {
    evaluations: number;
    enabledPercentage: number;
    apiRequests: number;
    uniqueUsers: number;
    variantDistribution: Record<string, number>;
    topRulesMatched: Record<string, number>;
    trend: { date: string; enabled: number; disabled: number }[];
  };
}
