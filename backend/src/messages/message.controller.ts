import { FastifyRequest, FastifyReply } from "fastify";
import { messageService } from "./message.service";

export async function getTripMessages(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { tripId } = req.params as { tripId: string };

  const messages = await messageService.getByTrip(tripId);
  return reply.send(messages);
}