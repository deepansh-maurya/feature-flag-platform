import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { UserStatus } from 'generated/prisma';
//import { UserStatus } from 'generated/prisma'

/* ---------- Inputs ---------- */
export class CreateUserDto {
  @IsEmail() email: string;
  @IsString() @IsNotEmpty() name: string;

  /** Pass hashed password from Auth flow; omit for SSO users */
  @IsOptional() @IsString() passwordHash?: string;

  /** For SSO: e.g., 'google', 'github', 'okta' */
  @IsOptional() @IsString() externalIdp?: string;

  /** optional initial status override; default = invited/active in repo */
  @IsOptional() @IsEnum(UserStatus) status?: UserStatus;
}

export class UpdateUserDto {
  @IsUUID() id: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(UserStatus) status?: UserStatus;
  @IsOptional() @IsString() externalIdp?: string;
  /** If you ever rehash during migration-only flows */
  @IsOptional() @IsString() passwordHash?: string;
}

export class SoftDeleteUserDto {
  @IsUUID() id: string;
}

export class GetUserByEmailDto {
  @IsEmail() email: string;
}

/* ---------- Outputs ---------- */
export class UserDto {
  @IsUUID() id: string;
  @IsEmail() email: string;
  @IsString() name: string;

  /** never expose passwordHash outside trusted/internal calls; included for mapping symmetry */
  passwordHash?: string | null;

  @IsOptional() @IsString() externalIdp?: string | null;
  @IsEnum(UserStatus) status: UserStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
