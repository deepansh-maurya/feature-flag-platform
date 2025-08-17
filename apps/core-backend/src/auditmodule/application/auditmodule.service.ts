import { Inject, Injectable } from '@nestjs/common';
import { AuditmoduleRepo, AuditmoduleRepoToken } from './ports/auditmodule.repo';

@Injectable()
export class AuditmoduleService {
  constructor(@Inject(AuditmoduleRepoToken) private readonly repo: AuditmoduleRepo) {}

  async list() { return this.repo.list(); }
  async get(id) { return this.repo.get(id); }
  async create(dto) { return this.repo.create(dto); }
}