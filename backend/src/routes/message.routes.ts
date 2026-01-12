import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/authenticate";
import { getTripMessages } from "../messages/message.controller";

export async function messageRoutes(app: FastifyInstance) {
  app.get(
    "/trips/:tripId/messages",
    { preHandler: authenticate },
    getTripMessages
  );
}