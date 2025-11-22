import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
  Version,
} from '@nestjs/common';
import crypto from 'crypto';
import qs from 'qs';

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
import Redis from 'ioredis';

@Controller({ path: 'auth', version: '1' })
export class AuthmoduleController {
  private redis: Redis;
  constructor(
    private readonly svc: AuthmoduleService,
    private readonly REDIS_URL = process.env.REDIS_URL,
    private readonly BASE_URL = process.env.BASE_URL,
    private readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CONSOLE_CLIENT_ID,
    private readonly GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID,
  ) {
    this.redis = new Redis(REDIS_URL!);
  }

  genRandomBase64Url(bytes = 32) {
    return crypto.randomBytes(bytes).toString('base64url');
  }

  sha256Base64Url(input: string) {
    return Buffer.from(
      crypto.createHash('sha256').update(input).digest(),
    ).toString('base64url');
  }

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

  @Get('auth/:provider')
  @Redirect(undefined, 302)
  async oauth(
    @Param('provider') provider: string,
    @Query('returnTo') returnTo: string,
  ) {
    const allowedReturnTo = '/app'
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const providerRaw = String(provider || '').toLowerCase();
    if (providerRaw !== 'google' && providerRaw !== 'github')
      return new BadRequestException('unsupported provider');

    const requestedReturnTo = String(returnTo || '');
    const returnToPath = allowedReturnTo.includes(requestedReturnTo)
      ? requestedReturnTo
      : allowedReturnTo[0] || '/';

    const state = this.genRandomBase64Url(32);

    let code_verifier: string | undefined;
    let code_challenge: string | undefined;
    const pkceEnabled = false;
    if (pkceEnabled) {
      code_verifier = this.genRandomBase64Url(64);
      code_challenge = this.sha256Base64Url(code_verifier);
    }

    const meta = {
      provider: providerRaw,
      returnToPath,
      createdAt: Date.now(),
      code_verifier: code_verifier || '',
    };

    await this.redis.set(
      `oauth:state:${state}`,
      JSON.stringify(meta),
      'EX',
      900,
    );

    return providerRaw === 'google'
      ? this.svc.buildGoogleAuthUrl({ state, code_challenge })
      : this.svc.buildGithubAuthUrl({ state, code_challenge });
  }

  @Get('auth/:provider/callback')
  @Redirect(undefined, 302)
  async oauthCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    const providerRaw = String(provider || '').toLowerCase();
    if (providerRaw !== 'google' && providerRaw !== 'github')
      return new BadRequestException('unsupported provider');
    const authProvider = providerRaw as 'google' | 'github';

    if (error) {
      console.warn('provider returned error:', error);
      return new BadRequestException(`Provider error: ${error}`);
    }

    if (!code || !state)
      return new BadRequestException('missing code or state');

    const raw = await this.redis.get(`oauth:state:${state}`);
    if (!raw)
      return new BadRequestException(
        'invalid or expired state (possible CSRF)',
      );

    await this.redis.del(`oauth:state:${state}`);
    const meta = JSON.parse(raw);
    const code_verifier = meta.code_verifier;
    const returnTo = meta.returnTo || '/';

    const session = await this.svc.oauthCallback(
      authProvider,
      code,
      code_verifier,
      returnTo,
    );

    res.cookie(
      'refresh_token',
      session.refreshToken,
      this.svc.refreshCookieOptions(),
    );

    return res.redirect(302, returnTo);
  }

  @Get('auth/sso-check')
  async ssoCheck(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const session = await this.redis.get(user.id);

    this.redis.del(user.id);

    return res.json({
      accessToken: session,
    });
  }
}
