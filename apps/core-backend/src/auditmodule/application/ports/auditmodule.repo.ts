
import { AuditActionType } from "generated/prisma";

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

export interface AuditModuleRepo {
  append(dto: CreateAuditLog): Promise<void>;
  getById(id: string): Promise<AuditLogRecord | null>;
  list(params: ListAuditLogsParams): Promise<ListResult>;
  exportCsv(params: ListAuditLogsParams): Promise<string>; // returns CSV string
}
