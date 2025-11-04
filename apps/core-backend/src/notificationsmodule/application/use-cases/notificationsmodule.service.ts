import { Inject, Injectable } from '@nestjs/common';
import {
  NotificationsmoduleRepo,
  NotificationsmoduleRepoToken,
} from '../ports/notificationsmodule.repo';

@Injectable()
export class NotificationsmoduleService {
  constructor(
    @Inject(NotificationsmoduleRepoToken)
    private readonly repo: NotificationsmoduleRepo,
  ) {}

  async list() {
    return this.repo.list();
  }
  async get(id) {
    return this.repo.get(id);
  }
  async create(dto) {
    return this.repo.create(dto);
  }
}
