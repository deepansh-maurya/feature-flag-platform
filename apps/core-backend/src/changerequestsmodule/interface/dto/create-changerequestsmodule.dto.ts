import { IsOptional, IsString } from 'class-validator';

export class CreateChangerequestsmoduleDto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}

