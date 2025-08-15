import { IsOptional, IsString } from 'class-validator';

export class CreateDeliverysyncmoduleDto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}

