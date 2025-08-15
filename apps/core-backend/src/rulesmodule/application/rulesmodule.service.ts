import { Inject, Injectable } from '@nestjs/common';
import { RulesmoduleRepo, RulesmoduleRepoToken } from './ports/rulesmodule.repo';

@Injectable()
export class RulesmoduleService {
  constructor(@Inject(RulesmoduleRepoToken) private readonly repo: RulesmoduleRepo) {}

  async list() { return this.repo.list(); }
  async get(id) { return this.repo.get(id); }
  async create(dto) { return this.repo.create(dto); }
}

