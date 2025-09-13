// apps/core-backend/src/flagsmodule/application/ports/flagsmodule.repo.ts
import { FlagType } from 'generated/prisma'
import { CreateFlagDto, CreateVersionDto, UpsertFlagMetaDto } from 'src/flagsmodule/interface/dto/create-flagsmodule.dto';

export const FLAGS_REPO = Symbol('FLAGS_REPO');

// ---- Return shape ----
export type FlagMetaDTO = {
  id: string;
  key: string;
  type: FlagType;
  description?: string | null;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
  projectId: string;
  displayName?: string;
  tags?: string[];
};

export interface FlagsRepository {
  // queries
  isKeyTaken(params: { projectId: string; key: string }): Promise<boolean>;
  getById(id: string): Promise<FlagMetaDTO | null>;
  getByKey(projectId: string, key: string): Promise<FlagMetaDTO | null>;
  listByProject(projectId: string): Promise<FlagMetaDTO[]>;

  // mutations
  createFlag(input: CreateFlagDto ): Promise<{ flagId: string; versionId: string }>;
  createVersion(input: CreateVersionDto): Promise<{ versionId: string }>;

  // metadata
  upsertMeta(params: UpsertFlagMetaDto): Promise<void>;

  // lifecycle
  archive(flagId: string): Promise<void>;
}
