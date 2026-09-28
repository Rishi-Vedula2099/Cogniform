import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Env } from "../../../config/env.config";
import type { AuthUser } from "../../../common/decorators/current-user.decorator";

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<Env>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        // Also support reading from cookie for SSR / API calls
        (request) => {
          let token: string | null = null;
          if (request?.cookies?.access_token) {
            token = request.cookies.access_token;
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get("JWT_ACCESS_SECRET"),
    });
  }

  /**
   * passport-jwt calls validate() with the decoded payload.
   * Whatever we return is attached to `request.user`.
   */
  async validate(payload: JwtPayload): Promise<AuthUser> {
    if (!payload.sub) {
      throw new UnauthorizedException("Invalid token payload");
    }
    return { id: payload.sub, email: payload.email };
  }
}
