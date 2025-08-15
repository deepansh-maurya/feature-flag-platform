import { IsOptional, IsString } from 'class-validator';

export class CreateUsersmoduleDto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}

