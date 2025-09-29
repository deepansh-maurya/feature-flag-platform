import { IsString, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnvKey } from 'generated/prisma';

export class CreateRulesmoduleDto {
  @ApiProperty({ example: 'workspace_123' })
  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @ApiProperty({ example: 'project_456' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ example: 'flag_789' })
  @IsString()
  @IsNotEmpty()
  flagId: string;

  @ApiProperty({ example: 'dev' })
  @IsString()
  @IsNotEmpty()
  envKey: EnvKey;

  @ApiProperty({ example: 'user_abc' })
  @IsString()
  @IsNotEmpty()
  actorUserId: string;

  @ApiProperty({ example: ['Show to US users over 21'] })
  @IsArray()
  @IsNotEmpty()
  rawRules: string[];

  @ApiProperty({
    description: 'Optional existing ruleset id to replace',
    required: false,
  })
  previousRuleSetId?: string;
}
