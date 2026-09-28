import { Controller, Get, Param, Patch, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.notificationsService.getNotifications(user.id);
  }

  @Patch(":id/read")
  markAsRead(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch("read-all")
  markAllAsRead(@CurrentUser() user: AuthUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
