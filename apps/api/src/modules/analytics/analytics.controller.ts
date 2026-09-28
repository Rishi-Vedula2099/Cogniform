import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { Public } from "../../common/decorators/public.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Post("forms/:formId/view")
  trackView(
    @Param("formId") formId: string,
    @Body() body?: { device?: string; browser?: string; country?: string },
  ) {
    return this.analyticsService.trackView(formId, body);
  }

  @Get("forms/:formId")
  @UseGuards(JwtAuthGuard)
  getFormAnalytics(@Param("formId") formId: string) {
    return this.analyticsService.getFormAnalytics(formId);
  }
}
