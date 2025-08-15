import { IsOptional, IsString } from 'class-validator';

export class CreateAuditmoduleDto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}

