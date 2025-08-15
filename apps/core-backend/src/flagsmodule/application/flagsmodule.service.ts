import { Inject, Injectable } from '@nestjs/common';
import { FlagsmoduleRepo, FlagsmoduleRepoToken } from './ports/flagsmodule.repo';

@Injectable()
export class FlagsmoduleService {
  constructor(@Inject(FlagsmoduleRepoToken) private readonly repo: FlagsmoduleRepo) {}

  async list() { return this.repo.list(); }
  async get(id) { return this.repo.get(id); }
  async create(dto) { return this.repo.create(dto); }
}

