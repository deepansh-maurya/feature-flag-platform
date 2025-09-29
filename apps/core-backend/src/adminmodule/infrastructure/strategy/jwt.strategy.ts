import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import PrismaService from 'src/infra/prisma/prisma.service';

export interface JwtPayload extends Request {
  id: string;
  deviceId: string;
  iat: number;
  eat: string;
}

function fromCookie(cookieName: string) {
  return (req: any) => req.cookies?.[cookieName] || null;
}

@Injectable()
export default class AdminJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(@Inject() private readonly prisma: PrismaService) {
    super({
      // Try header first, then cookie (adjust if you only use one)
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        fromCookie('passkey'),
      ]),
      secretOrKey: process.env.JWT_ACCESS_SECRET!, // set in env
      ignoreExpiration: false,
      // optional hardening (set if you include them when signing)
      issuer: process.env.JWT_ISSUER || undefined,
      audience: process.env.JWT_AUDIENCE || undefined,
    });
  }

  /**
   * Runs ONLY after signature/expiry checks pass.
   * Whatever you return here becomes `req.user`.
   */
  async validate(payload: JwtPayload) {
    if (!payload?.id) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.id, deviceId: payload.deviceId },
    });

    if (!admin) throw new UnauthorizedException('unauthorized user');

    return {
      id: payload.id,
    };
  }
}
