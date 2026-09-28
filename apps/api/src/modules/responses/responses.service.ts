import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { FormStatus } from "@prisma/client";

@Injectable()
export class ResponsesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch public form schema by slug (for unauthenticated end-users).
   */
  async getPublicForm(slug: string) {
    const form = await this.prisma.form.findFirst({
      where: {
        slug,
        isPublished: true,
        status: FormStatus.PUBLISHED,
      },
      select: {
        id: true,
        title: true,
        description: true,
        slug: true,
        password: true,
        captchaEnabled: true,
        allowEmbed: true,
        customDomain: true,
        sections: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            order: true,
            isConditional: true,
            fields: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                type: true,
                label: true,
                placeholder: true,
                helpText: true,
                required: true,
                defaultValue: true,
                order: true,
                width: true,
                options: true,
                settings: true,
                isConditional: true,
                validations: {
                  select: { id: true, type: true, value: true, message: true },
                },
                logicRules: {
                  select: { id: true, action: true, operator: true, value: true, targetFieldId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException("Form not found or is no longer accepting responses.");
    }

    return form;
  }

  /**
   * Submit response answers to a published form.
   */
  async submitResponse(
    slug: string,
    payload: {
      answers: Record<string, any>;
      duration?: number;
      metadata?: Record<string, any>;
    },
    clientInfo?: { ip?: string; userAgent?: string },
  ) {
    const form = await this.prisma.form.findFirst({
      where: {
        slug,
        isPublished: true,
        status: FormStatus.PUBLISHED,
      },
    });

    if (!form) {
      throw new NotFoundException("Form is not available for submissions.");
    }

    const response = await this.prisma.response.create({
      data: {
        formId: form.id,
        respondentIp: clientInfo?.ip,
        userAgent: clientInfo?.userAgent,
        duration: payload.duration,
        isCompleted: true,
        completedAt: new Date(),
        metadata: payload.metadata || undefined,
        answers: {
          create: Object.entries(payload.answers).map(([fieldId, val]) => ({
            fieldId,
            value: typeof val === "object" ? val : { text: String(val) },
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    return {
      message: "Response submitted successfully!",
      responseId: response.id,
    };
  }

  /**
   * Fetch all captured responses for a form.
   */
  async getFormResponses(formId: string) {
    const responses = await this.prisma.response.findMany({
      where: { formId },
      orderBy: { completedAt: "desc" },
      include: {
        answers: {
          include: {
            field: {
              select: { id: true, label: true, type: true },
            },
          },
        },
      },
    });

    return responses;
  }

  /**
   * Export captured responses in CSV format.
   */
  async exportCsv(formId: string): Promise<string> {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        sections: {
          include: { fields: { orderBy: { order: "asc" } } },
        },
        responses: {
          include: { answers: true },
          orderBy: { completedAt: "desc" },
        },
      },
    });

    if (!form) throw new NotFoundException("Form not found");

    const fields = form.sections.flatMap((s) => s.fields);
    const headers = ["Response ID", "Submitted At", "Duration (s)", ...fields.map((f) => `"${f.label.replace(/"/g, '""')}"`)].join(",");

    const rows = form.responses.map((resp) => {
      const answerMap = new Map(resp.answers.map((a) => [a.fieldId, a.value]));
      const values = fields.map((f) => {
        const valObj: any = answerMap.get(f.id);
        const textVal = valObj ? (typeof valObj === "string" ? valObj : valObj.text || JSON.stringify(valObj)) : "";
        return `"${String(textVal).replace(/"/g, '""')}"`;
      });

      return [resp.id, resp.completedAt ? resp.completedAt.toISOString() : "", resp.duration || "", ...values].join(",");
    });

    return [headers, ...rows].join("\n");
  }
}
