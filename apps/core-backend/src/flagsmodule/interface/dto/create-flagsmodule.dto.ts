// apps/core-backend/src/flagsmodule/interface/dto/create-flag.dto.ts
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { EnvKey, FlagType } from 'generated/prisma';

export class CreateFlagEnvConfigDto {
  @IsEnum(EnvKey)
  envKey!: EnvKey;

  @IsBoolean()
  enabled!: boolean;

  // For multivariate flags
  @IsOptional()
  @IsString()
  @Length(1, 120)
  variantKey?: string | null;

  // For json flags (and general payload)
  @IsOptional()
  jsonValue?: unknown | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  rollout?: number | null;

  // Serialized rule AST
  @IsOptional()
  rules?: unknown | null;
}

export class CreateFlagDto {
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsString()
  @Matches(/^[a-z0-9_-]+$/)
  @Length(1, 100)
  key!: string;

  @IsEnum(FlagType)
  type!: FlagType;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string | null;

  @IsString()
  @IsNotEmpty()
  createdBy!: string;

  // Display name in FlagMeta
  @IsString()
  @Length(1, 140)
  name!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateFlagEnvConfigDto)
  envs!: CreateFlagEnvConfigDto[];

  @IsOptional()
  @IsString()
  @Length(0, 280)
  comment?: string | null;
}

// Client-friendly request: workspaceId and createdBy are injected server-side from the authenticated user.
export class CreateFlagRequestDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsString()
  @Matches(/^[a-z0-9_-]+$/)
  @Length(1, 100)
  key!: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string | null;

  // Display name in FlagMeta
  @IsString()
  @Length(1, 140)
  name!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];
}

export class CreateVersionEnvConfigDto {
  @IsEnum(EnvKey)
  envKey!: EnvKey;

  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  variantKey?: string | null;

  @IsOptional()
  jsonValue?: unknown | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  rollout?: number | null;

  @IsOptional()
  rules?: unknown | null;
}

export class CreateVersionDto {
  @IsString()
  @IsNotEmpty()
  flagId!: string;

  @IsString()
  @IsNotEmpty()
  createdBy!: string;

  @IsOptional()
  @IsString()
  @Length(0, 280)
  comment?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateVersionEnvConfigDto)
  envs!: CreateVersionEnvConfigDto[];
}

export class UpsertFlagMetaDto {
  @IsString()
  @IsNotEmpty()
  flagId!: string;

  @IsString()
  @Length(1, 140)
  name!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class IsKeyTakenDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsString()
  @Matches(/^[a-z0-9_-]+$/)
  @Length(1, 100)
  key!: string;
}
