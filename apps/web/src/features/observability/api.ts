// src/features/analytics/api.ts
import { http } from "@/src/shared/lib/http";
import type {
  RecordEvaluationDto,
  GetOverviewDto,
  GetFlagMetricsDto,
} from "./types";


import type {
  CreateAuditLog,
  AuditLogRecord,
  ListAuditLogsParams,
  ListResult,
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





/** Append a new audit row (fire-and-forget) */
export async function append(dto: CreateAuditLog): Promise<void> {
  await http.post("/api/v1/audit", dto);
}

/** Get one audit record by id */
export async function getById(id: string): Promise<AuditLogRecord | null> {
  const { data } = await http.get(`/api/v1/audit/${id}`);
  return (data ?? null) as AuditLogRecord | null;
}

/** List/cursor through audit logs (filters + search supported via params) */
export async function list(params: ListAuditLogsParams): Promise<ListResult> {
  const { data } = await http.get("/api/v1/audit", { params });
  return data as ListResult;
}

/** Export CSV (text). Useful if you want to upload/send the CSV string directly. */
export async function exportCsv(params: ListAuditLogsParams): Promise<string> {
  const { data } = await http.get("/api/v1/audit/export/csv", {
    params,
    responseType: "text",
  });
  // axios returns string already with responseType 'text'
  return data as string;
}

/** Convenience: Export CSV as a Blob (handy for downloads) */
export async function exportCsvBlob(params: ListAuditLogsParams): Promise<Blob> {
  const { data } = await http.get("/api/v1/audit/export/csv", {
    params,
    responseType: "blob",
  });
  return data as Blob;
}
