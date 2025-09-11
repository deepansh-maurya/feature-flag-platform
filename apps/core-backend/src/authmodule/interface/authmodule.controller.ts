import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  Version,
} from '@nestjs/common';
import { AuthmoduleService } from '../application/use-cases/authmodule.service';
import {
  ChangePasswordDto,
  DeleteUserDto,
  LoginDto,
  LogoutDto,
  RegisterDto,
} from './dto/create-authmodule.dto';
import { Public } from './decorators/public.decorator';
import {
  JwtAuthGuard,
  RefreshAuthGuard,
} from '../infrastructure/guards/jwt-auth.guard';
import { JwtPayload } from '../infrastructure/strategy/jwt.strategy';
import { Request, Response } from 'express';

@Controller({ path: 'auth', version: '1' })
export class AuthmoduleController {
  constructor(private readonly svc: AuthmoduleService) {}

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refreshAccessToken(@Req() req: Request & JwtPayload) {
    const { userId, email, workspaceId } = req.user as any;

    return this.svc.refreshToken({ userId, email, workspaceId });
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    console.log(dto, 16);

    const { accessToken, refreshToken } = await this.svc.register(dto);
    res.cookie('refresh', refreshToken, this.svc.refreshCookieOptions());
    console.log('end');

    return res.json({ accessToken });
  }

  @Get('ping')
  ping() {
    console.log('HIT /auth/ping');
    return { ok: true };
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    console.log(dto, 16);

    const { accessToken, refreshToken, user, workspace } =
      await this.svc.login(dto);
    console.log(accessToken, refreshToken, 47);

    res.cookie('refresh', refreshToken, this.svc.refreshCookieOptions());
    console.log('end');

    return res.json({ accessToken, user, workspace });
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
  @Delete('me')
  async delete(@Body() dto: DeleteUserDto) {
    return this.svc.delete(dto.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async get(@Req() req: Request & JwtPayload) {
    const { userId, email, workspaceId } = req.user as any;
    return this.svc.getUser(userId);
  }
}
