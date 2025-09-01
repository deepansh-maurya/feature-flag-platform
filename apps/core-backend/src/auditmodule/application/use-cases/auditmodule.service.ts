import { Inject, Injectable } from '@nestjs/common';
import { AuditModuleRepo, AuditmoduleRepoToken, CreateAuditLog, ListAuditLogsParams } from '../ports/auditmodule.repo';

@Injectable()
export class AuditModuleService {
  constructor( @Inject(AuditmoduleRepoToken) private readonly repo: AuditModuleRepo) {}

  async append(dto: CreateAuditLog): Promise<void> {
    // (optional) enrich/validate dto here
    await this.repo.append(dto);
  }

  async getById(id: string) {
    return this.repo.getById(id);
  }

  async list(params: ListAuditLogsParams) {
    return this.repo.list(params);
  }

  async exportCsv(params: ListAuditLogsParams) {
    return this.repo.exportCsv(params);
  }
}
