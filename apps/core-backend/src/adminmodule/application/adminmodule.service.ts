import { Inject, Injectable } from '@nestjs/common';
import { AdminmoduleRepo, AdminmoduleRepoToken } from './ports/adminmodule.repo';

@Injectable()
export class AdminmoduleService {
  constructor(@Inject(AdminmoduleRepoToken) private readonly repo: AdminmoduleRepo) {}

  async list() { return this.repo.list(); }
  async get(id) { return this.repo.get(id); }
  async create(dto) { return this.repo.create(dto); }
}

