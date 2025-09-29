import { IsOptional, IsString } from 'class-validator';

export class CreateNotificationsmoduleDto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}
