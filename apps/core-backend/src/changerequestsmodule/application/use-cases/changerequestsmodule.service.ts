import { Inject, Injectable } from '@nestjs/common';
import { CHANGEREQUEST_REPO, ChangeRequestRepo } from '../ports/changerequestsmodule.repo';
import {
  ApproveChangeRequestDto,
  CreateChangeRequestDto,
  GetByFlagEnvDto,
  MarkAppliedChangeRequestDto,
  RejectChangeRequestDto,
} from '../../interface/dto/create-changerequestsmodule.dto';

@Injectable()
export class ChangeRequestService {
  constructor(
    @Inject(CHANGEREQUEST_REPO) private readonly repo: ChangeRequestRepo,
  ) {}

  create(dto: CreateChangeRequestDto) {
    return this.repo.create(dto);
  }

  getById(id: string) {
    return this.repo.findById(id);
  }

  listByFlagEnv(dto: GetByFlagEnvDto) {
    return this.repo.listByFlagEnv(dto);
  }

  listOpenByEnv(flagId: string, envKey: string) {
    return this.repo.listOpenByEnv(flagId, envKey);
  }

  approve(dto: ApproveChangeRequestDto) {
    return this.repo.approve(dto);
  }

  reject(dto: RejectChangeRequestDto) {
    return this.repo.reject(dto);
  }

  markApplied(dto: MarkAppliedChangeRequestDto) {
    return this.repo.markApplied(dto);
  }
}
