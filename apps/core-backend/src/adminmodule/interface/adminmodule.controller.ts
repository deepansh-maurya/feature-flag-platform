import { Controller, Get, Query, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/authmodule/infrastructure/guards/jwt-auth.guard';
import { AuditService } from '../application/use-cases/adminmodule.service';

@UseGuards(JwtAuthGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly svc: AuditService) {}

  @Get('list')
  async list(@Query() q: any) {
    // in your auth guard, attach req.user.workspaceId
    const filters = {
      workspaceId: q.workspaceId,               // or from req.user
      q: q.q,
      entityType: q.entityType,
      actionType: q.actionType,
      envKey: q.envKey,
      projectId: q.projectId,
      actorUserId: q.actorUserId,
      cursor: q.cursor,
      limit: q.limit ? Number(q.limit) : undefined,
    };
    return this.svc.list(filters);
  }

  @Get('detail/:id')
  async detail(@Param('id') id: string, @Query('workspaceId') workspaceId: string) {
    return this.svc.get(id, workspaceId);
  }

  @Get('export.csv')
  async export(@Query() q: any, @Res() res: Response) {
    const buf = await this.svc.exportCsv({
      workspaceId: q.workspaceId,
      q: q.q,
      entityType: q.entityType,
      actionType: q.actionType,
      envKey: q.envKey,
      projectId: q.projectId,
      actorUserId: q.actorUserId,
      limit: 1000,
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="audit.csv"');
    return res.send(buf);
  }
}
