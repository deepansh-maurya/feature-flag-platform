import { IsOptional, IsString } from 'class-validator';

export class CreateFlagsmoduleDto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}

