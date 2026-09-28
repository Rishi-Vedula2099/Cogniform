import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { IntegrationsService } from "./integrations.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { IntegrationType } from "@prisma/client";

@Controller("integrations")
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  findAll(@Query("workspaceId") workspaceId: string) {
    return this.integrationsService.findAll(workspaceId);
  }

  @Post()
  upsert(
    @Body()
    body: {
      workspaceId: string;
      type: IntegrationType;
      name: string;
      config: Record<string, any>;
    },
  ) {
    return this.integrationsService.upsertIntegration(
      body.workspaceId,
      body.type,
      body.name,
      body.config,
    );
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.integrationsService.deleteIntegration(id);
  }
}
