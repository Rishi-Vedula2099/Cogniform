import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";
import { CreateWorkspaceDto, UpdateWorkspaceDto, InviteMemberDto, UpdateMemberRoleDto } from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";
import { Role } from "@prisma/client";

@Controller("workspaces")
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.workspacesService.findAllForUser(user.id);
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.findOne(id, user.id);
  }

  @Patch(":id")
  @Roles(Role.OWNER, Role.ADMIN)
  update(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(id, user.id, dto);
  }

  @Delete(":id")
  @Roles(Role.OWNER)
  delete(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.delete(id, user.id);
  }

  @Post(":id/members")
  @Roles(Role.OWNER, Role.ADMIN)
  inviteMember(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: InviteMemberDto,
  ) {
    return this.workspacesService.inviteMember(id, user.id, dto);
  }

  @Patch(":id/members/:memberId")
  @Roles(Role.OWNER, Role.ADMIN)
  updateMemberRole(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.workspacesService.updateMemberRole(id, user.id, memberId, dto);
  }

  @Delete(":id/members/:memberId")
  @Roles(Role.OWNER, Role.ADMIN)
  removeMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspacesService.removeMember(id, user.id, memberId);
  }
}
