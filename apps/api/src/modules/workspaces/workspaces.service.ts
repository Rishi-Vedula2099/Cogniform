import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AuditAction, Role } from "@prisma/client";
import { CreateWorkspaceDto, UpdateWorkspaceDto, InviteMemberDto, UpdateMemberRoleDto } from "./dto";

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Create a new workspace and assign creator as OWNER.
   */
  async create(userId: string, dto: CreateWorkspaceDto) {
    let slug = dto.slug;

    if (!slug) {
      const base = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      slug = `${base}-${Date.now().toString(36)}`;
    }

    const existing = await this.prisma.workspace.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new ConflictException("Workspace slug already exists. Please choose another.");
    }

    const workspace = await this.prisma.workspace.create({
      data: {
        name: dto.name,
        slug,
        logo: dto.logo,
        members: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    });

    await this.auditService.log({
      userId,
      action: AuditAction.CREATE,
      resource: "workspace",
      resourceId: workspace.id,
      details: { name: workspace.name, slug: workspace.slug },
    });

    return workspace;
  }

  /**
   * List all workspaces user is a member of.
   */
  async findAllForUser(userId: string) {
    const memberships = await this.prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            _count: {
              select: { members: true, forms: true },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
      memberCount: m.workspace._count.members,
      formCount: m.workspace._count.forms,
    }));
  }

  /**
   * Get single workspace details by ID or slug.
   */
  async findOne(identifier: string, userId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { forms: true, integrations: true, webhooks: true },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException("Workspace not found or access denied");
    }

    const currentMember = workspace.members.find((m) => m.userId === userId);

    return {
      ...workspace,
      role: currentMember?.role,
    };
  }

  /**
   * Update workspace settings.
   */
  async update(workspaceId: string, userId: string, dto: UpdateWorkspaceDto) {
    await this.ensureRole(workspaceId, userId, [Role.OWNER, Role.ADMIN]);

    const updated = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.logo !== undefined && { logo: dto.logo }),
      },
    });

    await this.auditService.log({
      userId,
      action: AuditAction.UPDATE,
      resource: "workspace",
      resourceId: workspaceId,
      details: dto,
    });

    return updated;
  }

  /**
   * Delete workspace (only OWNER can delete).
   */
  async delete(workspaceId: string, userId: string) {
    await this.ensureRole(workspaceId, userId, [Role.OWNER]);

    await this.prisma.workspace.delete({
      where: { id: workspaceId },
    });

    await this.auditService.log({
      userId,
      action: AuditAction.DELETE,
      resource: "workspace",
      resourceId: workspaceId,
    });

    return { message: "Workspace deleted successfully" };
  }

  /**
   * Invite or add member to workspace.
   */
  async inviteMember(workspaceId: string, inviterId: string, dto: InviteMemberDto) {
    await this.ensureRole(workspaceId, inviterId, [Role.OWNER, Role.ADMIN]);

    // Find or placeholder user
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          name: dto.email.split("@")[0],
        },
      });
    }

    const existingMember = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException("User is already a member of this workspace");
    }

    const member = await this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: user.id,
        role: dto.role,
        invitedBy: inviterId,
        acceptedAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    await this.auditService.log({
      userId: inviterId,
      action: AuditAction.INVITE,
      resource: "member",
      resourceId: member.id,
      details: { invitedEmail: dto.email, role: dto.role },
    });

    return member;
  }

  /**
   * Update member role.
   */
  async updateMemberRole(
    workspaceId: string,
    currentUserId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
  ) {
    await this.ensureRole(workspaceId, currentUserId, [Role.OWNER, Role.ADMIN]);

    const targetMember = await this.prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      throw new NotFoundException("Workspace member not found");
    }

    if (targetMember.role === Role.OWNER && currentUserId !== targetMember.userId) {
      throw new ForbiddenException("Cannot modify ownership role of another workspace owner");
    }

    const updated = await this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: dto.role },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    await this.auditService.log({
      userId: currentUserId,
      action: AuditAction.UPDATE,
      resource: "member",
      resourceId: memberId,
      details: { newRole: dto.role },
    });

    return updated;
  }

  /**
   * Remove member from workspace.
   */
  async removeMember(workspaceId: string, currentUserId: string, memberId: string) {
    await this.ensureRole(workspaceId, currentUserId, [Role.OWNER, Role.ADMIN]);

    const targetMember = await this.prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      throw new NotFoundException("Workspace member not found");
    }

    if (targetMember.role === Role.OWNER) {
      throw new BadRequestException("Cannot remove workspace owner");
    }

    await this.prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    await this.auditService.log({
      userId: currentUserId,
      action: AuditAction.REVOKE,
      resource: "member",
      resourceId: memberId,
    });

    return { message: "Member removed from workspace" };
  }

  /**
   * Private helper to verify user's workspace role.
   */
  private async ensureRole(workspaceId: string, userId: string, allowedRoles: Role[]) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
    });

    if (!member || !allowedRoles.includes(member.role)) {
      throw new ForbiddenException("You do not have sufficient permissions in this workspace");
    }
  }
}
