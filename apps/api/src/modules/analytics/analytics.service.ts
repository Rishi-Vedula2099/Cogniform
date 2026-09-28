import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Track a form page view (increment daily view count).
   */
  async trackView(formId: string, metadata?: { device?: string; browser?: string; country?: string }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deviceKey = metadata?.device || "desktop";
    const browserKey = metadata?.browser || "chrome";
    const countryKey = metadata?.country || "US";

    const existing = await this.prisma.formAnalytics.findUnique({
      where: {
        formId_date: {
          formId,
          date: today,
        },
      },
    });

    if (!existing) {
      await this.prisma.formAnalytics.create({
        data: {
          formId,
          date: today,
          views: 1,
          responses: 0,
          completions: 0,
          devices: { [deviceKey]: 1 },
          browsers: { [browserKey]: 1 },
          countries: { [countryKey]: 1 },
        },
      });
    } else {
      const devices = (existing.devices as Record<string, number>) || {};
      const browsers = (existing.browsers as Record<string, number>) || {};
      const countries = (existing.countries as Record<string, number>) || {};

      devices[deviceKey] = (devices[deviceKey] || 0) + 1;
      browsers[browserKey] = (browsers[browserKey] || 0) + 1;
      countries[countryKey] = (countries[countryKey] || 0) + 1;

      await this.prisma.formAnalytics.update({
        where: { id: existing.id },
        data: {
          views: { increment: 1 },
          devices,
          browsers,
          countries,
        },
      });
    }
  }

  /**
   * Fetch aggregated analytics dashboard metrics for a form.
   */
  async getFormAnalytics(formId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        _count: {
          select: { responses: true },
        },
      },
    });

    if (!form) {
      throw new NotFoundException("Form not found");
    }

    const analyticsRecords = await this.prisma.formAnalytics.findMany({
      where: { formId },
      orderBy: { date: "asc" },
    });

    const totalViews = analyticsRecords.reduce((sum, r) => sum + r.views, 0);
    const totalResponses = form._count.responses;
    const conversionRate = totalViews > 0 ? Math.round((totalResponses / totalViews) * 100 * 10) / 10 : 0;

    // Aggregate device & browser breakdowns
    const deviceBreakdown: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 };
    const browserBreakdown: Record<string, number> = { Chrome: 0, Firefox: 0, Safari: 0, Edge: 0, Other: 0 };

    for (const r of analyticsRecords) {
      if (r.devices && typeof r.devices === "object") {
        for (const [k, v] of Object.entries(r.devices as Record<string, number>)) {
          deviceBreakdown[k] = (deviceBreakdown[k] || 0) + (Number(v) || 0);
        }
      }
      if (r.browsers && typeof r.browsers === "object") {
        for (const [k, v] of Object.entries(r.browsers as Record<string, number>)) {
          browserBreakdown[k] = (browserBreakdown[k] || 0) + (Number(v) || 0);
        }
      }
    }

    // Format daily chart data
    const dailyChart = analyticsRecords.map((r) => ({
      date: r.date.toISOString().split("T")[0],
      views: r.views,
      responses: r.responses,
    }));

    return {
      summary: {
        totalViews,
        totalResponses,
        conversionRate,
      },
      dailyChart,
      deviceBreakdown,
      browserBreakdown,
    };
  }
}
