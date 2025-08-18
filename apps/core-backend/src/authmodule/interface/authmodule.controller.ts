import { Body, Controller, Delete, Post } from '@nestjs/common';
import { AuthmoduleService } from '../application/use-cases/authmodule.service';
import { ChangePasswordDto, DeleteUserDto, LoginDto, LogoutDto, RegisterDto } from './dto/create-authmodule.dto';

@Controller('auth')
export class AuthmoduleController {
  constructor(private readonly svc: AuthmoduleService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.svc.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.svc.login(dto);
  }

  @Post('logout')
  async logout(@Body() dto: LogoutDto) {
    return this.svc.logout(dto.refreshToken);
  }

  @Post('change-password')
  async changePassword(@Body() dto: ChangePasswordDto) {
    return this.svc.changePassword(dto);
  }

  @Delete()
  async delete(@Body() dto: DeleteUserDto) {
    return this.svc.delete(dto.userId);
  }
}