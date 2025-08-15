import { IsOptional, IsString } from 'class-validator';

export class CreateBillingmoduleDto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}

