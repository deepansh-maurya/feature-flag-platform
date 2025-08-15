import { IsOptional, IsString } from 'class-validator';

export class CreateWorkspacesmoduleDto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}

