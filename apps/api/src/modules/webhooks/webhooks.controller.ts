import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { WebhooksService } from "./webhooks.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { WebhookEvent } from "@prisma/client";

@Controller("webhooks")
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  findAll(@Query("workspaceId") workspaceId: string) {
    return this.webhooksService.findAll(workspaceId);
  }

  @Post()
  create(
    @Body()
    body: {
      workspaceId: string;
      url: string;
      events: WebhookEvent[];
      formId?: string;
    },
  ) {
    return this.webhooksService.create(
      body.workspaceId,
      body.url,
      body.events,
      body.formId,
    );
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.webhooksService.delete(id);
  }

  @Post(":id/test")
  testWebhook(@Param("id") id: string) {
    return this.webhooksService.testWebhook(id);
  }
}
