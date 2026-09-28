import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";

@Controller("audit")
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.auditService.queryLogs(user.id);
  }
}
