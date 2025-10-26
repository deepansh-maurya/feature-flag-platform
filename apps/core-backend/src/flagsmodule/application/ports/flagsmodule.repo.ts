// apps/core-backend/src/flagsmodule/application/ports/flagsmodule.repo.ts
import { FlagType } from 'generated/prisma';
import {
  CreateFlagDto,
  CreateFlagRequestDto,
  CreateVersionDto,
  UpsertFlagMetaDto,
} from 'src/flagsmodule/interface/dto/create-flagsmodule.dto';

export const FLAGS_REPO = Symbol('FLAGS_REPO');

export type FlagMetaDTO = {
  id: string;
  key: string;
  type?: FlagType; // 👈 make it optional if not implemented yet
  description?: string | null;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
  projectId: string;
  displayName?: string;
  name?: string; // 👈 add if you want to expose "name"
  tags?: string[];
  createdBy?: string | null;
};

export interface FlagsRepository {
  // queries
  isKeyTaken(params: { projectId: string; key: string }): Promise<boolean>;
  getById(id: string): Promise<FlagMetaDTO | null>;
  getByKey(projectId: string, key: string): Promise<FlagMetaDTO | null>;

  getEnvFromFlag(flagId: string): Promise<any | null>;

  listByProject(projectId: string): Promise<FlagMetaDTO[]>;

  // mutations
  createFlag(input: CreateFlagRequestDto): Promise<{ flagId: string }>;

  // update flag (name, description, tags, archived)
  updateFlag(
    flagId: string,
    data: {
      name?: string;
      description?: string | null;
      tags?: string[];
      archived?: boolean;
    },
  ): Promise<void>;
  // delete flag permanently
  deleteFlag(flagId: string): Promise<void>;

  // lifecycle
  archive(flagId: string): Promise<void>;
}
