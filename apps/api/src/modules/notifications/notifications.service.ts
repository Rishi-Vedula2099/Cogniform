import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get unread & recent notifications for a user.
   */
  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) throw new NotFoundException("Notification not found");

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all user notifications as read.
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Internal method to dispatch a notification to a user.
   */
  async createNotification(userId: string, title: string, message: string, type = "system", data?: any) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data: data || undefined,
        isRead: false,
      },
    });
  }
}
