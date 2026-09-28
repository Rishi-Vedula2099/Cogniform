import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { IntegrationType } from "@prisma/client";

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List integrations for a workspace.
   */
  async findAll(workspaceId: string) {
    return this.prisma.integration.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Connect or update an integration.
   */
  async upsertIntegration(
    workspaceId: string,
    type: IntegrationType,
    name: string,
    config: Record<string, any>,
  ) {
    const existing = await this.prisma.integration.findFirst({
      where: { workspaceId, type },
    });

    if (existing) {
      return this.prisma.integration.update({
        where: { id: existing.id },
        data: { name, config, isEnabled: true },
      });
    }

    return this.prisma.integration.create({
      data: {
        workspaceId,
        type,
        name,
        config,
        isEnabled: true,
      },
    });
  }

  /**
   * Disconnect integration.
   */
  async deleteIntegration(id: string) {
    const integration = await this.prisma.integration.findUnique({ where: { id } });
    if (!integration) throw new NotFoundException("Integration not found");

    return this.prisma.integration.delete({ where: { id } });
  }
}
