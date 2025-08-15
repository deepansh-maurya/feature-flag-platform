import { IsOptional, IsString } from 'class-validator';

export class CreateAnalyticsmoduleDto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}

