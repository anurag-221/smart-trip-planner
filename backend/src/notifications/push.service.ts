import { prisma } from "../lib/prisma";
import webpush from "web-push";

interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const pushService = {
  async saveSubscription(userId: string, subscription: PushSubscriptionPayload) {
    return prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: { userId, ...subscription.keys },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });
  },

  async deleteSubscription(endpoint: string) {
    return prisma.pushSubscription.deleteMany({ where: { endpoint } });
  },

  async getSubscriptionsByUser(userId: string) {
    return prisma.pushSubscription.findMany({ where: { userId } });
  },

  async sendPushNotification(userId: string, payload: object) {
    const subscriptions = await this.getSubscriptionsByUser(userId);
    if (!subscriptions.length) return;

    const notificationPayload = JSON.stringify(payload);

    for (const sub of subscriptions) {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };
      try {
        await webpush.sendNotification(pushSubscription, notificationPayload);
      } catch (error: any) {
        console.error(`Failed to send push to ${sub.endpoint}:`, error);
        // If subscription is no longer valid, delete it
        if (error.statusCode === 404 || error.statusCode === 410) {
          await this.deleteSubscription(sub.endpoint);
        }
      }
    }
  },
};
