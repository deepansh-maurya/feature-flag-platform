
type AuditActionType = "workspace_created"
    | "workspace_updated"
    | "project_created"
    | "project_updated"
    | "flag_created"
    | "flag_updated"
    | "flag_published"
    | "flag_archived"
    | "segment_created"
    | "segment_updated"
    | "member_invited"
    | "member_added"
    | "member_removed"
    | "token_created"
    | "token_revoked"


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

export interface CreateAuditLog {
    workspaceId: string;
    projectId?: string | null;
    envKey?: string | null;

    entityType: string;
    entityId: string;
    entityKey?: string | null;

    actionType: AuditActionType;
    title: string;
    description?: string | null;

    actorUserId: string;
    actorName: string;

    beforeJson?: unknown | null;
    afterJson?: unknown | null;

    metadata?: Record<string, unknown> | null;
}

export type ListDirection = 'forward' | 'backward';

export interface ListAuditLogsParams {
    workspaceId: string;
    projectId?: string;
    envKey?: string;
    actionType?: AuditActionType;
    entityType?: string;
    actorUserId?: string;
    search?: string;              // search in title/description/entityKey
    limit?: number;               // default 50
    cursor?: string | null;       // createdAt ISO or opaque id
    direction?: ListDirection;    // default 'backward' (newest first)
}

export interface AuditLogRecord {
    id: string;
    workspaceId: string;
    projectId?: string | null;
    envKey?: string | null;

    entityType: string;
    entityId: string;
    entityKey?: string | null;

    actionType: AuditActionType;
    title: string;
    description?: string | null;

    actorUserId: string;
    actorName: string;

    beforeJson?: unknown | null;
    afterJson?: unknown | null;

    metadata?: Record<string, unknown> | null;

    createdAt: string; // ISO
}

export interface ListResult {
    items: AuditLogRecord[];
    nextCursor: string | null;
}