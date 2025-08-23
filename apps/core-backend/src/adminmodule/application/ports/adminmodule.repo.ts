import { AuditActionType } from "generated/prisma";

export const AuditRepoToken = Symbol('AuditRepo');

export type AuditCreate = {
  workspaceId: string;
  projectId?: string;
  envKey?: string;

  entityType: 'flag' | 'targeting' | 'project' | 'environment' | 'user' | string;
  entityId: string;
  entityKey?: string;

  actionType: AuditActionType;
  title: string;
  description?: string;

  actorUserId: string;
  actorName: string;

  beforeJson?: unknown;
  afterJson?: unknown;
  metadata?: Record<string, unknown>;
};

export type AuditFilters = {
  workspaceId: string;
  q?: string;                     // free text search (title/entityKey/actorName)
  entityType?: string;
  actionType?: AuditActionType;
  envKey?: string;
  projectId?: string;
  actorUserId?: string;

  cursor?: string;                // for keyset pagination
  limit?: number;                 // default 25
};

export type AuditListItem = {
  id: string;
  createdAt: Date;
  actionType: AuditActionType;
  title: string;
  description?: string;

  envKey?: string;
  projectId?: string;

  entityType: string;
  entityId: string;
  entityKey?: string;

  actorName: string;
  actorUserId: string;

  beforeJson?: unknown;
  afterJson?: unknown;
};

export interface AuditRepo {
  create(entry: AuditCreate): Promise<void>;
  list(filters: AuditFilters): Promise<{ items: AuditListItem[]; nextCursor?: string }>;
  getById(id: string, workspaceId: string): Promise<AuditListItem | null>;
  exportCsv(filters: AuditFilters): Promise<Buffer>;
}
