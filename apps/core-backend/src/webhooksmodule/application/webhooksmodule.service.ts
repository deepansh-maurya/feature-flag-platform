import { Inject, Injectable } from '@nestjs/common';
import { WebhooksmoduleRepo, WebhooksmoduleRepoToken } from './ports/webhooksmodule.repo';

@Injectable()
export class WebhooksmoduleService {
  constructor(@Inject(WebhooksmoduleRepoToken) private readonly repo: WebhooksmoduleRepo) {}

  async list() { return this.repo.list(); }
  async get(id) { return this.repo.get(id); }
  async create(dto) { return this.repo.create(dto); }
}

