import { Injectable } from '@nestjs/common';
import {
  AuditModuleRepo,
  AuditLogRecord,
  CreateAuditLog,
  ListAuditLogsParams,
  ListResult,
} from '../../application/ports/auditmodule.repo';
import PrismaService from 'src/infra/prisma/prisma.service';
import { AuditActionType } from 'generated/prisma';

@Injectable()
export class PrismaAuditModuleRepo implements AuditModuleRepo {
  constructor(private readonly prisma: PrismaService) {}

  async append(dto: CreateAuditLog): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        workspaceId: dto.workspaceId,
        projectId: dto.projectId ?? null,
        envKey: dto.envKey ?? null,
        entityType: dto.entityType,
        entityId: dto.entityId,
        entityKey: dto.entityKey ?? null,
        actionType: dto.actionType,
        title: dto.title,
        description: dto.description ?? null,
        actorUserId: dto.actorUserId,
        actorName: dto.actorName,
        beforeJson: dto.beforeJson as any,
        afterJson: dto.afterJson as any,
        metadata: dto.metadata as any,
      },
    });
  }

  async getById(id: string): Promise<AuditLogRecord | null> {
    const row = await this.prisma.auditLog.findUnique({ where: { id } });
    if (!row) return null;
    return this.map(row);
  }

  async list(params: ListAuditLogsParams): Promise<ListResult> {
    const {
      workspaceId,
      projectId,
      envKey,
      actionType,
      entityType,
      actorUserId,
      search,
      limit = 50,
      cursor,
      direction = 'backward',
    } = params;

    const where: any = { workspaceId };
    if (projectId) where.projectId = projectId;
    if (envKey) where.envKey = envKey;
    if (actionType) where.actionType = actionType as AuditActionType;
    if (entityType) where.entityType = entityType;
    if (actorUserId) where.actorUserId = actorUserId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { entityKey: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = { createdAt: direction === 'backward' ? 'desc' : 'asc' } as const;

    const results = await this.prisma.auditLog.findMany({
      where,
      orderBy,
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
    });

    const items = results.slice(0, limit).map(this.map);
    const nextCursor = results.length > limit ? results[limit].id : null;
    return { items, nextCursor };
  }

  async exportCsv(params: ListAuditLogsParams): Promise<string> {
    const { items } = await this.list({ ...params, limit: 5000 }); // cap export
    const header = [
      'id',
      'createdAt',
      'workspaceId',
      'projectId',
      'envKey',
      'entityType',
      'entityId',
      'entityKey',
      'actionType',
      'title',
      'description',
      'actorUserId',
      'actorName',
    ].join(',');

    const lines = items.map((r) =>
      [
        r.id,
        r.createdAt,
        r.workspaceId,
        r.projectId ?? '',
        r.envKey ?? '',
        r.entityType,
        r.entityId,
        r.entityKey ?? '',
        r.actionType,
        csvEscape(r.title),
        csvEscape(r.description ?? ''),
        r.actorUserId,
        csvEscape(r.actorName),
      ].join(','),
    );

    return [header, ...lines].join('\n');
  }

  private map = (row: any): AuditLogRecord => ({
    id: row.id,
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    envKey: row.envKey,
    entityType: row.entityType,
    entityId: row.entityId,
    entityKey: row.entityKey,
    actionType: row.actionType,
    title: row.title,
    description: row.description,
    actorUserId: row.actorUserId,
    actorName: row.actorName,
    beforeJson: row.beforeJson,
    afterJson: row.afterJson,
    metadata: row.metadata,
    createdAt: row.createdAt.toISOString(),
  });
}

function csvEscape(v: string) {
  const needsQuotes = /[",\n]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}
