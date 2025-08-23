import { Injectable } from '@nestjs/common';
import { AuditCreate, AuditFilters, AuditListItem, AuditRepo } from 'src/adminmodule/application/ports/adminmodule.repo';
import PrismaService from 'src/infra/prisma/prisma.service';

@Injectable()
export class PrismaAuditRepo implements AuditRepo {
    constructor(private readonly prisma: PrismaService) { }

    async create(e: AuditCreate): Promise<void> {
        await this.prisma.auditLog.create({
            data: {
                ...e,
                beforeJson: (e.beforeJson ?? null) as any,
                afterJson: (e.afterJson ?? null) as any,
                metadata: (e.metadata ?? null) as any,
            },
        });
    }

    async list(f: AuditFilters) {
        const take = Math.min(f.limit ?? 25, 100);

        const where: any = {
            workspaceId: f.workspaceId,
            ...(f.entityType ? { entityType: f.entityType } : {}),
            ...(f.actionType ? { actionType: f.actionType } : {}),
            ...(f.projectId ? { projectId: f.projectId } : {}),
            ...(f.envKey ? { envKey: f.envKey } : {}),
            ...(f.actorUserId ? { actorUserId: f.actorUserId } : {}),
            ...(f.q
                ? {
                    OR: [
                        { title: { contains: f.q, mode: 'insensitive' } },
                        { entityKey: { contains: f.q, mode: 'insensitive' } },
                        { actorName: { contains: f.q, mode: 'insensitive' } },
                    ],
                }
                : {}),
        };

        const rows = await this.prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: take + 1,
            ...(f.cursor ? { cursor: { id: f.cursor }, skip: 1 } : {}),
            select: {
                id: true,
                createdAt: true,
                actionType: true,
                title: true,
                description: true,     // string | null
                envKey: true,          // string | null
                projectId: true,       // string | null
                entityType: true,
                entityId: true,
                entityKey: true,       // string | null
                actorName: true,
                actorUserId: true,
                beforeJson: true,      // Prisma.JsonValue
                afterJson: true,       // Prisma.JsonValue
            },
        });

        const hasMore = rows.length > take;
        if (hasMore) rows.pop();

        // Map DB → domain (null → undefined; JsonValue → unknown)
        const items: AuditListItem[] = rows.map((r) => ({
            id: r.id,
            createdAt: r.createdAt,
            actionType: r.actionType,
            title: r.title,
            description: r.description ?? undefined,
            envKey: r.envKey ?? undefined,
            projectId: r.projectId ?? undefined,
            entityType: r.entityType,
            entityId: r.entityId,
            entityKey: r.entityKey ?? undefined,
            actorName: r.actorName,
            actorUserId: r.actorUserId,
            beforeJson: r.beforeJson as unknown,
            afterJson: r.afterJson as unknown,
        }));

        return {
            items,
            nextCursor: hasMore ? items[items.length - 1].id : undefined,
        };
    }
    async getById(id: string, workspaceId: string) {
        return this.prisma.auditLog.findFirst({
            where: { id, workspaceId },
        }) as any;
    }

    async exportCsv(f: AuditFilters) {
        const { items } = await this.list({ ...f, limit: 1000 }); // cap export
        const rows = items.map((i) => ({
            id: i.id,
            createdAt: i.createdAt.toISOString(),
            actionType: i.actionType,
            title: i.title,
            envKey: i.envKey ?? '',
            projectId: i.projectId ?? '',
            entityType: i.entityType,
            entityId: i.entityId,
            entityKey: i.entityKey ?? '',
            actorName: i.actorName,
            actorUserId: i.actorUserId,
            before: JSON.stringify(i.beforeJson ?? {}),
            after: JSON.stringify(i.afterJson ?? {}),
        }));
        const csv = this.toCsv(rows);
        return Buffer.from(csv, 'utf8');
    }

    private toCsv(rows: Record<string, any>[]): string {
        if (!rows.length) return '';
        const headers = Object.keys(rows[0]);
        const escape = (val: any) => {
            const s = String(val ?? '');
            return `"${s.replace(/"/g, '""')}"`; // wrap in quotes, escape quotes
        };
        const headerLine = headers.join(',');
        const lines = rows.map(row => headers.map(h => escape(row[h])).join(','));
        return [headerLine, ...lines].join('\n');
    }


}
