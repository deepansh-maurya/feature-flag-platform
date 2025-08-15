import { IsOptional, IsString } from 'class-validator';

export class CreateRulesmoduleDto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}

