import { IsOptional, IsString } from 'class-validator';

export class CreateAuthmoduleDto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}

