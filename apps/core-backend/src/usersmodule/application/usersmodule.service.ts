import { Inject, Injectable } from '@nestjs/common';
import { UsersmoduleRepo, UsersmoduleRepoToken } from './ports/usersmodule.repo';

@Injectable()
export class UsersmoduleService {
  constructor(@Inject(UsersmoduleRepoToken) private readonly repo: UsersmoduleRepo) {}

  async list() { return this.repo.list(); }
  async get(id) { return this.repo.get(id); }
  async create(dto) { return this.repo.create(dto); }
}

