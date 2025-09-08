import { IsEmail, IsJWT, IsString, IsUUID, MinLength } from 'class-validator';

export class RegisterDto {

  @IsString()
  workspace: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;


  @IsString()
  fullName: string;
}

export class RefreshDto {
  @IsString()
  
  userId:string 
  @IsString()

  email:string
  @IsString()

  workspaceId:string
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class LogoutDto {
  @IsString()
  @IsJWT()
  refreshToken: string;
}
export class ChangePasswordDto {

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(8)
  confirmPassword: string;
}

export class DeleteUserDto {
  @IsUUID()
  userId: string;
}