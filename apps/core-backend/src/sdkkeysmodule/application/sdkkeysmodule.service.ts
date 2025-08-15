import { Inject, Injectable } from '@nestjs/common';
import { SdkkeysmoduleRepo, SdkkeysmoduleRepoToken } from './ports/sdkkeysmodule.repo';

@Injectable()
export class SdkkeysmoduleService {
  constructor(@Inject(SdkkeysmoduleRepoToken) private readonly repo: SdkkeysmoduleRepo) {}

  async list() { return this.repo.list(); }
  async get(id) { return this.repo.get(id); }
  async create(dto) { return this.repo.create(dto); }
}

