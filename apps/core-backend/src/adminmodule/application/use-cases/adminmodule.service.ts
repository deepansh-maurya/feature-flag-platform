import { Inject, Injectable } from '@nestjs/common';
import { AuditCreate, AuditFilters, AuditRepo, AuditRepoToken } from '../ports/adminmodule.repo';

@Injectable()
export class AuditService {
  constructor(@Inject(AuditRepoToken) private readonly repo: AuditRepo) {}

  log(entry: AuditCreate) {
    return this.repo.create(entry);
  }

  list(filters: AuditFilters) {
    return this.repo.list(filters);
  }

  get(id: string, workspaceId: string) {
    return this.repo.getById(id, workspaceId);
  }

  exportCsv(filters: AuditFilters) {
    return this.repo.exportCsv(filters);
  }
}
