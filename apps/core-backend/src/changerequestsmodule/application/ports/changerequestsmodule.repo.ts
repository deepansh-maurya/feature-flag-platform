import {
  ApproveChangeRequestDto,
  ChangeRequestDto,
  CreateChangeRequestDto,
  GetByFlagEnvDto,
  MarkAppliedChangeRequestDto,
  RejectChangeRequestDto,
} from '../../interface/dto/create-changerequestsmodule.dto';

export const CHANGEREQUEST_REPO = Symbol('CHANGEREQUEST_REPO');

export interface ChangeRequestRepo {
  create(input: CreateChangeRequestDto): Promise<ChangeRequestDto>;
  findById(id: string): Promise<ChangeRequestDto | null>;
  listByFlagEnv(input: GetByFlagEnvDto): Promise<ChangeRequestDto[]>;
  listOpenByEnv(flagId: string, envKey: string): Promise<ChangeRequestDto[]>;

  approve(input: ApproveChangeRequestDto): Promise<ChangeRequestDto>;
  reject(input: RejectChangeRequestDto): Promise<ChangeRequestDto>;
  markApplied(input: MarkAppliedChangeRequestDto): Promise<ChangeRequestDto>;
}
