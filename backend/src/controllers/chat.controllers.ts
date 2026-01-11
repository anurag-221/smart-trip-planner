import { FastifyRequest, FastifyReply } from "fastify";
import { sendChatMessage } from "../realtime/chat.service";
import { AuthenticatedRequest } from "../auth/authenticated-request";

export async function sendMessageHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { tripId } = authReq.params as any;
  const { message } = authReq.body as any;

  sendChatMessage({
    tripId,
    userId: authReq.user.id,
    message,
  });

  return reply.send({ status: "SENT" });
}