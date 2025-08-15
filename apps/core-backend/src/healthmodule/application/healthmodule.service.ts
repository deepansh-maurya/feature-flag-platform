import { Inject, Injectable } from '@nestjs/common';
import { HealthmoduleRepo, HealthmoduleRepoToken } from './ports/healthmodule.repo';

@Injectable()
export class HealthmoduleService {
  constructor(@Inject(HealthmoduleRepoToken) private readonly repo: HealthmoduleRepo) {}

  async list() { return this.repo.list(); }
  async get(id) { return this.repo.get(id); }
  async create(dto) { return this.repo.create(dto); }
}

