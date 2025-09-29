import { IsOptional, IsString } from 'class-validator';

export class CreateWebhooksmoduleDto {
  @IsString()
  key;

  @IsOptional()
  @IsString()
  description;
}
