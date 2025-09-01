import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Request } from "express"
import { ExtractJwt, Strategy } from "passport-jwt"

export interface JwtPayload extends Request {
    sub: string
    email: string
    role: string
    workspaceId: string
    iat: number
    eat: string
}

function fromCookie(cookieName: string) {
    return (req: any) => req.cookies?.[cookieName] || null
}

@Injectable()
export default class JwtStrategy extends PassportStrategy(Strategy, "jwt") {

    constructor() {
        super({
            // Try header first, then cookie (adjust if you only use one)
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                fromCookie('access_token'),
            ]),
            secretOrKey: process.env.JWT_ACCESS_SECRET!,   // set in env
            ignoreExpiration: false,
        });
    }


    /**
     * Runs ONLY after signature/expiry checks pass.
     * Whatever you return here becomes `req.user`.
     */
    async validate(payload: JwtPayload) {
        // Example: fail if user marked disabled in DB (uncomment if you want DB check)
        // const user = await this.usersService.findById(payload.sub);
        // if (!user || user.disabled) throw new UnauthorizedException('User disabled');



        if (!payload?.sub) {
            throw new UnauthorizedException('Invalid token payload');
        }

        return {
            userId: payload.sub,
            email: payload.email,
            workspaceId: payload.workspaceId,
            roles: payload.role ?? [],
        };
    }


}