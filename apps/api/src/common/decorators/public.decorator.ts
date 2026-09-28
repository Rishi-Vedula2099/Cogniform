import { SetMetadata } from "@nestjs/common";

/**
 * Mark a route or controller as publicly accessible (skips JwtAuthGuard).
 *
 *   @Public()
 *   @Get('login')
 */
export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
