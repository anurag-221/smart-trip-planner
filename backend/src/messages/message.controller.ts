import { FastifyRequest, FastifyReply } from "fastify";
import { messageService } from "./message.service";

export async function getTripMessages(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { tripId } = req.params as { tripId: string };

  const messages = messageService.getByTrip(tripId);
  reply.send(messages);
}