import { Inject, Injectable } from '@nestjs/common';
import { ChangerequestsmoduleRepo, ChangerequestsmoduleRepoToken } from './ports/changerequestsmodule.repo';

@Injectable()
export class ChangerequestsmoduleService {
  constructor(@Inject(ChangerequestsmoduleRepoToken) private readonly repo: ChangerequestsmoduleRepo) {}

  async list() { return this.repo.list(); }
  async get(id) { return this.repo.get(id); }
  async create(dto) { return this.repo.create(dto); }
}

