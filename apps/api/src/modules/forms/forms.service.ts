import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AuditAction, FieldType, FormStatus, LogicAction, LogicOperator, Role } from "@prisma/client";
import { CreateFormDto, UpdateFormDto, CreateFieldDto } from "./dto";

@Injectable()
export class FormsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create a new form and initialize its default first section.
   */
  async create(userId: string, dto: CreateFormDto) {
    await this.ensureWorkspaceAccess(dto.workspaceId, userId, [Role.OWNER, Role.ADMIN, Role.EDITOR]);

    const baseSlug = dto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const form = await this.prisma.form.create({
      data: {
        title: dto.title,
        description: dto.description,
        slug,
        workspaceId: dto.workspaceId,
        creatorId: userId,
        status: FormStatus.DRAFT,
        sections: {
          create: {
            title: "Section 1",
            order: 0,
          },
        },
      },
      include: {
        sections: {
          include: {
            fields: true,
          },
        },
      },
    });

    await this.auditService.log({
      userId,
      action: AuditAction.CREATE,
      resource: "form",
      resourceId: form.id,
      details: { title: form.title, slug: form.slug },
    });

    return form;
  }

  /**
   * List forms in a workspace.
   */
  async findAllInWorkspace(workspaceId: string, userId: string) {
    await this.ensureWorkspaceAccess(workspaceId, userId);

    const forms = await this.prisma.form.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: "desc" },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { responses: true, sections: true },
        },
      },
    });

    return forms.map((f) => ({
      ...f,
      responseCount: f._count.responses,
      sectionCount: f._count.sections,
    }));
  }

  /**
   * Get single form with full tree structure.
   */
  async findOne(identifier: string, userId: string) {
    const form = await this.prisma.form.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        sections: {
          orderBy: { order: "asc" },
          include: {
            fields: {
              orderBy: { order: "asc" },
              include: {
                validations: true,
                logicRules: true,
              },
            },
          },
        },
        _count: {
          select: { responses: true, versions: true },
        },
      },
    });

    if (!form) {
      throw new NotFoundException("Form not found");
    }

    await this.ensureWorkspaceAccess(form.workspaceId, userId);

    return form;
  }

  /**
   * Update form settings or publish status with version snapshotting.
   */
  async update(formId: string, userId: string, dto: UpdateFormDto) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        sections: {
          include: {
            fields: {
              include: { validations: true, logicRules: true },
            },
          },
        },
      },
    });
    if (!form) throw new NotFoundException("Form not found");

    await this.ensureWorkspaceAccess(form.workspaceId, userId, [Role.OWNER, Role.ADMIN, Role.EDITOR]);

    const data: any = { ...dto };
    if (dto.isPublished !== undefined) {
      data.isPublished = dto.isPublished;
      data.publishedAt = dto.isPublished ? new Date() : null;
      data.status = dto.isPublished ? FormStatus.PUBLISHED : FormStatus.DRAFT;

      if (dto.isPublished) {
        const nextVersion = form.version + 1;
        data.version = nextVersion;

        await this.prisma.formVersion.create({
          data: {
            formId: form.id,
            version: nextVersion,
            schema: form.sections as any,
            createdBy: userId,
            changeLog: `Published version v${nextVersion}`,
          },
        });
      }
    }

    const updated = await this.prisma.form.update({
      where: { id: formId },
      data,
    });

    await this.auditService.log({
      userId,
      action: dto.isPublished ? AuditAction.PUBLISH : AuditAction.UPDATE,
      resource: "form",
      resourceId: formId,
      details: dto,
    });

    return updated;
  }

  /**
   * Fetch published version snapshots for a form.
   */
  async getVersions(formId: string, userId: string) {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });
    if (!form) throw new NotFoundException("Form not found");

    await this.ensureWorkspaceAccess(form.workspaceId, userId);

    return this.prisma.formVersion.findMany({
      where: { formId },
      orderBy: { version: "desc" },
      include: {
        createdByUser: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Delete form.
   */
  async delete(formId: string, userId: string) {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });
    if (!form) throw new NotFoundException("Form not found");

    await this.ensureWorkspaceAccess(form.workspaceId, userId, [Role.OWNER, Role.ADMIN]);

    await this.prisma.form.delete({ where: { id: formId } });

    await this.auditService.log({
      userId,
      action: AuditAction.DELETE,
      resource: "form",
      resourceId: formId,
    });

    return { message: "Form deleted successfully" };
  }

  /**
   * Add section to form.
   */
  async addSection(formId: string, userId: string, title?: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { _count: { select: { sections: true } } },
    });
    if (!form) throw new NotFoundException("Form not found");

    await this.ensureWorkspaceAccess(form.workspaceId, userId, [Role.OWNER, Role.ADMIN, Role.EDITOR]);

    const section = await this.prisma.formSection.create({
      data: {
        formId,
        title: title || `Section ${form._count.sections + 1}`,
        order: form._count.sections,
      },
      include: { fields: true },
    });

    return section;
  }

  /**
   * Delete section.
   */
  async deleteSection(sectionId: string, userId: string) {
    const section = await this.prisma.formSection.findUnique({
      where: { id: sectionId },
      include: { form: true },
    });
    if (!section) throw new NotFoundException("Section not found");

    await this.ensureWorkspaceAccess(section.form.workspaceId, userId, [Role.OWNER, Role.ADMIN, Role.EDITOR]);

    await this.prisma.formSection.delete({ where: { id: sectionId } });
    return { message: "Section deleted" };
  }

  /**
   * Add field to a form section.
   */
  async addField(sectionId: string, userId: string, dto: CreateFieldDto) {
    const section = await this.prisma.formSection.findUnique({
      where: { id: sectionId },
      include: { form: true, _count: { select: { fields: true } } },
    });
    if (!section) throw new NotFoundException("Section not found");

    await this.ensureWorkspaceAccess(section.form.workspaceId, userId, [Role.OWNER, Role.ADMIN, Role.EDITOR]);

    const field = await this.prisma.formField.create({
      data: {
        sectionId,
        type: dto.type,
        label: dto.label,
        placeholder: dto.placeholder,
        helpText: dto.helpText,
        required: dto.required ?? false,
        defaultValue: dto.defaultValue,
        order: dto.order ?? section._count.fields,
        width: dto.width ?? 100,
        options: dto.options ? dto.options : undefined,
        settings: dto.settings ? dto.settings : undefined,
      },
      include: {
        validations: true,
        logicRules: true,
      },
    });

    return field;
  }

  /**
   * Update field.
   */
  async updateField(fieldId: string, userId: string, data: any) {
    const field = await this.prisma.formField.findUnique({
      where: { id: fieldId },
      include: { section: { include: { form: true } } },
    });
    if (!field) throw new NotFoundException("Field not found");

    await this.ensureWorkspaceAccess(field.section.form.workspaceId, userId, [Role.OWNER, Role.ADMIN, Role.EDITOR]);

    const updated = await this.prisma.formField.update({
      where: { id: fieldId },
      data: {
        ...(data.label && { label: data.label }),
        ...(data.placeholder !== undefined && { placeholder: data.placeholder }),
        ...(data.helpText !== undefined && { helpText: data.helpText }),
        ...(data.required !== undefined && { required: data.required }),
        ...(data.defaultValue !== undefined && { defaultValue: data.defaultValue }),
        ...(data.width !== undefined && { width: data.width }),
        ...(data.options !== undefined && { options: data.options }),
        ...(data.settings !== undefined && { settings: data.settings }),
      },
      include: {
        validations: true,
        logicRules: true,
      },
    });

    return updated;
  }

  /**
   * Delete field.
   */
  async deleteField(fieldId: string, userId: string) {
    const field = await this.prisma.formField.findUnique({
      where: { id: fieldId },
      include: { section: { include: { form: true } } },
    });
    if (!field) throw new NotFoundException("Field not found");

    await this.ensureWorkspaceAccess(field.section.form.workspaceId, userId, [Role.OWNER, Role.ADMIN, Role.EDITOR]);

    await this.prisma.formField.delete({ where: { id: fieldId } });
    return { message: "Field deleted" };
  }

  /**
   * Add a conditional logic rule to a field.
   */
  async addLogicRule(
    fieldId: string,
    userId: string,
    rule: {
      action: LogicAction;
      operator: LogicOperator;
      value?: string;
      targetFieldId?: string;
    },
  ) {
    const field = await this.prisma.formField.findUnique({
      where: { id: fieldId },
      include: { section: { include: { form: true } } },
    });
    if (!field) throw new NotFoundException("Field not found");

    await this.ensureWorkspaceAccess(field.section.form.workspaceId, userId, [Role.OWNER, Role.ADMIN, Role.EDITOR]);

    const logicRule = await this.prisma.fieldLogicRule.create({
      data: {
        fieldId,
        action: rule.action,
        operator: rule.operator,
        value: rule.value,
        targetFieldId: rule.targetFieldId,
      },
    });

    await this.prisma.formField.update({
      where: { id: fieldId },
      data: { isConditional: true },
    });

    return logicRule;
  }

  /**
   * Delete a logic rule.
   */
  async deleteLogicRule(ruleId: string, userId: string) {
    const rule = await this.prisma.fieldLogicRule.findUnique({
      where: { id: ruleId },
      include: { field: { include: { section: { include: { form: true } } } } },
    });
    if (!rule) throw new NotFoundException("Logic rule not found");

    await this.ensureWorkspaceAccess(rule.field.section.form.workspaceId, userId, [Role.OWNER, Role.ADMIN, Role.EDITOR]);

    await this.prisma.fieldLogicRule.delete({ where: { id: ruleId } });
    return { message: "Logic rule deleted" };
  }

  /**
   * Batch reorder sections & fields.
   */
  async reorder(formId: string, userId: string, payload: { sections: { id: string; order: number; fields?: { id: string; order: number; sectionId?: string }[] }[] }) {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });
    if (!form) throw new NotFoundException("Form not found");

    await this.ensureWorkspaceAccess(form.workspaceId, userId, [Role.OWNER, Role.ADMIN, Role.EDITOR]);

    await this.prisma.$transaction(async (tx) => {
      for (const s of payload.sections) {
        await tx.formSection.update({
          where: { id: s.id },
          data: { order: s.order },
        });

        if (s.fields) {
          for (const f of s.fields) {
            await tx.formField.update({
              where: { id: f.id },
              data: {
                order: f.order,
                ...(f.sectionId && { sectionId: f.sectionId }),
              },
            });
          }
        }
      }
    });

    return { message: "Reordered successfully" };
  }

  private async ensureWorkspaceAccess(workspaceId: string, userId: string, allowedRoles?: Role[]) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException("Access denied to this workspace");
    }

    if (allowedRoles && !allowedRoles.includes(member.role)) {
      throw new ForbiddenException("Insufficient permissions in workspace");
    }
  }
}
