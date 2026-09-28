import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export interface AuthUser {
  id: string;
  email: string;
  /** Resolved at login; never trust request body for these. */
}

/**
 * Extracts the authenticated user attached by JwtAuthGuard:
 *
 *   @Get('me')
 *   @UseGuards(JwtAuthGuard)
 *   me(@CurrentUser() user: AuthUser) { ... }
 *
 * Pass a key to pull a single field: `@CurrentUser('id')`.
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
