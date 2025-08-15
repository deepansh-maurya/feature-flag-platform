import { IsOptional, IsString } from 'class-validator';

export class CreateSdkkeysmoduleDto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}

