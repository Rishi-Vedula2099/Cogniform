import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { SignupDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from "./dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import type { Env } from "../../config/env.config";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<Env>,
  ) {}

  @Public()
  @Post("signup")
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    const secure = this.configService.get("SECURE_COOKIES");
    const domain = this.configService.get("AUTH_COOKIE_DOMAIN");

    res.clearCookie("access_token", { httpOnly: true, secure, domain, sameSite: "lax" });
    res.clearCookie("refresh_token", { httpOnly: true, secure, domain, sameSite: "lax" });

    return { message: "Logged out successfully" };
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Body("refreshToken") bodyToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token || bodyToken;
    if (!refreshToken) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "No refresh token provided" });
    }

    const tokens = await this.authService.refresh(refreshToken);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Public()
  @Post("verify-email")
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body("token") token: string) {
    return this.authService.verifyEmail(token);
  }

  /**
   * Helper method to attach access and refresh tokens as httpOnly cookies.
   */
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const secure = this.configService.get("SECURE_COOKIES");
    const domain = this.configService.get("AUTH_COOKIE_DOMAIN");

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure,
      domain,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure,
      domain,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
