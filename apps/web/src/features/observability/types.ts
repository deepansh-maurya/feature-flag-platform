
export interface RecordEvaluationDto {
  flagId: string;
  envKey: string;       // dev | stage | prod
  userId: string;
  enabled: boolean;
  variant?: string;     // e.g. control / treatment
  ruleMatched?: string; // e.g. geo-IN, plan-pro, fallthrough
  evaluatedAt: string;  // ISO string
}

export interface GetOverviewDto {
  projectId: string;
  envKey: string;
  from: string; // ISO date string
  to: string;   // ISO date string
}

export interface GetFlagMetricsDto {
  flagId: string;
  envKey: string;
  from: string; // ISO date string
  to: string;   // ISO date string
}
