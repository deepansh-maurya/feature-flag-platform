import { Inject, Injectable } from '@nestjs/common';
import { WorkspacesmoduleRepo, WorkspacesmoduleRepoToken } from './ports/workspacesmodule.repo';

@Injectable()
export class WorkspacesmoduleService {
  constructor(@Inject(WorkspacesmoduleRepoToken) private readonly repo: WorkspacesmoduleRepo) {}

  async list() { return this.repo.list(); }
  async get(id) { return this.repo.get(id); }
  async create(dto) { return this.repo.create(dto); }
}

