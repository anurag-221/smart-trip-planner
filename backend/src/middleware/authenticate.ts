import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "../auth/jwt";
import { User } from "../auth/user.types";

export async function authenticate(
  req: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: "UNAUTHORIZED" });
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token) as any;

    // ✅ attach user dynamically
    (req as any).user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    } satisfies User;
  } catch {
    return reply.status(401).send({ error: "INVALID_TOKEN" });
  }
}