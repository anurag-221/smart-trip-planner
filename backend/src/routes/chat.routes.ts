import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/authenticate";
import { sendMessageHandler } from "../controllers/chat.controllers";

export async function chatRoutes(app: FastifyInstance) {
  app.post(
    "/trips/:tripId/chat",
    { preHandler: authenticate },
    sendMessageHandler
  );
}