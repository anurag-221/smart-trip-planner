import { FastifyInstance } from "fastify";
import { notificationRoutes } from "./notification.routes";

export async function apiRoutes(app: FastifyInstance) {
  app.register(notificationRoutes);
}