import { Inject, Injectable } from '@nestjs/common';
import { AnalyticsmoduleRepo, AnalyticsmoduleRepoToken } from './ports/analyticsmodule.repo';

@Injectable()
export class AnalyticsmoduleService {
  constructor(@Inject(AnalyticsmoduleRepoToken) private readonly repo: AnalyticsmoduleRepo) {}

  async list() { return this.repo.list(); }
  async get(id) { return this.repo.get(id); }
  async create(dto) { return this.repo.create(dto); }
}

