import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditAction, Prisma } from "@prisma/client";

export interface LogAuditOptions {
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record an audit log entry for user actions across the platform.
   */
  async log(options: LogAuditOptions) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: options.userId,
          action: options.action,
          resource: options.resource,
          resourceId: options.resourceId,
          details: options.details ? (options.details as Prisma.InputJsonValue) : undefined,
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
        },
      });
    } catch (err) {
      console.error("Failed to write audit log entry:", err);
      return null;
    }
  }

  /**
   * Query audit logs for a workspace user or resource.
   */
  async queryLogs(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });
  }
}
