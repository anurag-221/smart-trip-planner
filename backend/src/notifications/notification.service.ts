import { prisma } from "../lib/prisma";
import { broadcastToTrip } from "../realtime/broadcast";
import { CreateNotificationPayload } from "./notification.types";
import { pushService } from "./push.service";

export const notificationService = {
  async create({
    userId,
    tripId,
    type,
    message,
  }: CreateNotificationPayload) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        tripId,
        type,
        message,
      },
    });

    // Broadcast to the recipient user via WebSocket (if connected to trip WS)
    broadcastToTrip(notification.tripId || "", { type: "NEW_NOTIFICATION", payload: notification }, userId);

    // Send Web Push Notification (for background/closed tabs)
    pushService.sendPushNotification(userId, {
      title: "New Notification",
      body: message,
      data: { notificationId: notification.id, tripId: notification.tripId },
    });

    return notification;
  },

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },

  async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  async deleteAllReadNotifications(userId: string) {
    return prisma.notification.deleteMany({ where: { userId, isRead: true } });
  },

  /** Single call: unread count, notifications list, and all pending join requests for trips owned by user */
  async getDashboard(userId: string) {
    const [unreadCount, notifications, pendingMembers] = await Promise.all([
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.tripMember.findMany({
        where: { status: "PENDING", trip: { ownerId: userId } },
        include: {
          trip: { select: { id: true, name: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    const pendingRequests = pendingMembers.map((m) => ({
      tripId: m.trip.id,
      tripName: m.trip.name,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
    }));

    return {
      unreadCount,
      notifications,
      pendingRequests,
      pendingCount: pendingRequests.length,
    };
  },
};