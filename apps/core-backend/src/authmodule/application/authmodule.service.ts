import { Inject, Injectable } from '@nestjs/common';
import { AuthmoduleRepo, AuthmoduleRepoToken } from './ports/authmodule.repo';

@Injectable()
export class AuthmoduleService {
  constructor(@Inject(AuthmoduleRepoToken) private readonly repo: AuthmoduleRepo) {}

  async list() { return this.repo.list(); }
  async get(id) { return this.repo.get(id); }
  async create(dto) { return this.repo.create(dto); }
}

