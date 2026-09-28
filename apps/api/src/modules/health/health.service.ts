import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export interface ReadinessReport {
  status: "ok" | "degraded";
  checks: Record<string, { status: "ok" | "fail"; latencyMs?: number; error?: string }>;
  timestamp: string;
}

/**
 * Aggregated readiness: ping the DB (and Redis once we wire BullMQ).
 * Designed to return 200 even when degraded — the caller decides the
 * severity from `status`. (Kubernetes typically wants 200 = route traffic.)
 */
@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  async checkReadiness(): Promise<ReadinessReport> {
    const checks: ReadinessReport["checks"] = {};

    // Database
    const dbStart = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = { status: "ok", latencyMs: Date.now() - dbStart };
    } catch (err) {
      checks.database = {
        status: "fail",
        error: err instanceof Error ? err.message : "unknown",
      };
    }

    const allOk = Object.values(checks).every((c) => c.status === "ok");
    return {
      status: allOk ? "ok" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    };
  }
}
