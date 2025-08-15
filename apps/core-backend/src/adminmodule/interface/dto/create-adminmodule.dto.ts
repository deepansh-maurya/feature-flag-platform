import { IsOptional, IsString } from 'class-validator';

export class CreateAdminmoduleDto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}

