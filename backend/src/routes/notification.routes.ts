import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { notificationService } from "../notifications/notification.service";
import { AuthenticatedRequest } from "../auth/authenticated-request";
import { authenticate } from "../middleware/authenticate";
import webpush from "web-push";
import { pushService } from "../notifications/push.service";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn("VAPID keys not set. Push notifications will not work.");
} else {
  webpush.setVapidDetails(
    "mailto:your_email@example.com", // Replace with a real email or URL
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
  );
}

export async function notificationRoutes(app: FastifyInstance) {
  app.post(
    "/notifications/subscribe",
    { preHandler: authenticate },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user.id;
      const subscription = req.body as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      if (!subscription || !subscription.endpoint || !subscription.keys) {
        return reply.status(400).send({ error: "Invalid subscription data" });
      }

      await pushService.saveSubscription(userId, subscription);
      return reply.send({ status: "OK" });
    },
  );

  app.post(
    "/notifications/unsubscribe",
    { preHandler: authenticate },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user.id;
      const { endpoint } = req.body as { endpoint: string };

      if (!endpoint) {
        return reply.status(400).send({ error: "Endpoint missing" });
      }

      await pushService.deleteSubscription(endpoint);
      return reply.send({ status: "OK" });
    },
  );

  app.get(
    "/notifications/vapid-public-key",
    async (req: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ publicKey: VAPID_PUBLIC_KEY });
    },
  );

  app.get(
    "/notifications/dashboard",
    { preHandler: authenticate },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const authReq = req as AuthenticatedRequest;
      const dashboard = await notificationService.getDashboard(authReq.user.id);
      return reply.send(dashboard);
    },
  );

  app.get(
    "/notifications/unread-count",
    { preHandler: authenticate },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user.id;
      const count = await notificationService.getUnreadCount(userId);
      return reply.send({ count });
    },
  );

  app.get(
    "/notifications",
    { preHandler: authenticate },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user.id;
      const notifications = await notificationService.getNotifications(userId);
      return reply.send(notifications);
    },
  );

  app.post(
    "/notifications/:notificationId/mark-as-read",
    { preHandler: authenticate },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user.id;
      const { notificationId } = req.params as { notificationId: string };
      await notificationService.markAsRead(notificationId, userId);
      return reply.send({ status: "OK" });
    },
  );

  app.post(
    "/notifications/mark-all-as-read",
    { preHandler: authenticate },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user.id;
      await notificationService.markAllAsRead(userId);
      return reply.send({ status: "OK" });
    },
  );

  app.post(
    "/notifications/delete-read",
    { preHandler: authenticate },
    async (req: FastifyRequest, reply: FastifyReply) => {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user.id;
      await notificationService.deleteAllReadNotifications(userId);
      return reply.send({ status: "OK" });
    },
  );
}