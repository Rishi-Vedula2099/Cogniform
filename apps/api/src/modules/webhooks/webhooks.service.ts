import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { WebhookEvent } from "@prisma/client";
import * as crypto from "crypto";

@Injectable()
export class WebhooksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List webhooks for a workspace.
   */
  async findAll(workspaceId: string) {
    return this.prisma.webhook.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Create a new webhook subscription with generated HMAC secret.
   */
  async create(
    workspaceId: string,
    url: string,
    events: WebhookEvent[],
    formId?: string,
  ) {
    const secret = `whsec_${crypto.randomBytes(24).toString("hex")}`;

    return this.prisma.webhook.create({
      data: {
        workspaceId,
        formId,
        url,
        secret,
        events: events.length ? events : [WebhookEvent.FORM_SUBMITTED],
        isEnabled: true,
      },
    });
  }

  /**
   * Delete webhook subscription.
   */
  async delete(id: string) {
    const webhook = await this.prisma.webhook.findUnique({ where: { id } });
    if (!webhook) throw new NotFoundException("Webhook not found");

    return this.prisma.webhook.delete({ where: { id } });
  }

  /**
   * Test dispatch payload for a webhook with HMAC-SHA256 signature.
   */
  async testWebhook(id: string) {
    const webhook = await this.prisma.webhook.findUnique({ where: { id } });
    if (!webhook) throw new NotFoundException("Webhook not found");

    const payload = {
      event: "FORM_SUBMITTED",
      timestamp: new Date().toISOString(),
      data: {
        formId: webhook.formId || "test_form_id",
        responseId: "resp_test_12345",
        answers: {
          name: "Jane Doe",
          email: "jane@example.com",
        },
      },
    };

    const signature = crypto
      .createHmac("sha256", webhook.secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cogniform-signature": signature,
        },
        body: JSON.stringify(payload),
      });

      const success = response.ok;

      await this.prisma.webhook.update({
        where: { id },
        data: {
          lastTriggeredAt: new Date(),
          ...(success
            ? { successCount: { increment: 1 } }
            : { failureCount: { increment: 1 } }),
        },
      });

      return {
        success,
        statusCode: response.status,
        message: success ? "Webhook test payload delivered successfully!" : `Failed with status ${response.status}`,
      };
    } catch (err: any) {
      await this.prisma.webhook.update({
        where: { id },
        data: {
          lastTriggeredAt: new Date(),
          failureCount: { increment: 1 },
        },
      });

      return {
        success: false,
        statusCode: 500,
        message: err.message || "Network error when reaching webhook URL",
      };
    }
  }
}
