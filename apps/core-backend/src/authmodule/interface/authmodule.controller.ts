import { Body, Controller, Delete, Post, Req, UseGuards, Version } from '@nestjs/common';
import { AuthmoduleService } from '../application/use-cases/authmodule.service';
import { ChangePasswordDto, DeleteUserDto, LoginDto, LogoutDto, RegisterDto } from './dto/create-authmodule.dto';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from '../infrastructure/guards/jwt-auth.guard';
import { JwtPayload } from '../infrastructure/strategy/jwt.strategy';
import { Response } from 'express';

@Controller({ path: 'auth', version: "1" })
export class AuthmoduleController {
  constructor(private readonly svc: AuthmoduleService) { }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, res: Response) {
    const { accessToken, refreshToken } = await this.svc.register(dto);
    res.cookie("refresh", refreshToken, this.svc.refreshCookieOptions())
    return accessToken
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, res: Response) {
    const { accessToken, refreshToken } = await this.svc.login(dto);
    res.cookie("refresh", refreshToken, this.svc.refreshCookieOptions())
    return accessToken
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body() dto: LogoutDto) {
    return this.svc.logout(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.svc.changePassword({ userId: req.sub, ...dto });
  }

  @UseGuards(JwtAuthGuard)
  @Delete("me")
  async delete(@Body() dto: DeleteUserDto) {
    return this.svc.delete(dto.userId);
  }
}