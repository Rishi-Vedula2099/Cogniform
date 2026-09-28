import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { PrismaService } from "../../prisma/prisma.service";
import type { AuthUser } from "../decorators/current-user.decorator";

const ROLE_RANK: Record<Role, number> = {
  OWNER: 4,
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
      params: Record<string, string>;
      body: Record<string, any>;
      headers: Record<string, string>;
    }>();

    const user = request.user;
    if (!user) {
      throw new UnauthorizedException("User is not authenticated");
    }

    // Resolve workspaceId from URL params, request body, or header
    const workspaceId =
      request.params.workspaceId ||
      request.params.id ||
      request.body?.workspaceId ||
      (request.headers["x-workspace-id"] as string);

    if (!workspaceId) {
      // If no workspace context found in request, allow pass or deny based on route requirements
      return true;
    }

    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException("You are not a member of this workspace");
    }

    const userRoleRank = ROLE_RANK[membership.role];
    const minRequiredRank = Math.min(...requiredRoles.map((r) => ROLE_RANK[r]));

    if (userRoleRank < minRequiredRank) {
      throw new ForbiddenException("You do not have required permissions to perform this action");
    }

    return true;
  }
}
