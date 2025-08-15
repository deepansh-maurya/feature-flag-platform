import { Inject, Injectable } from '@nestjs/common';
import { DeliverysyncmoduleRepo, DeliverysyncmoduleRepoToken } from './ports/deliverysyncmodule.repo';

@Injectable()
export class DeliverysyncmoduleService {
  constructor(@Inject(DeliverysyncmoduleRepoToken) private readonly repo: DeliverysyncmoduleRepo) {}

  async list() { return this.repo.list(); }
  async get(id) { return this.repo.get(id); }
  async create(dto) { return this.repo.create(dto); }
}

