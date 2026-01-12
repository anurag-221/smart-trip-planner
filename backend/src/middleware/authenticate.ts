import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "../auth/jwt";
import { User } from "../auth/user.types";
import { AuthenticatedRequest } from "../auth/authenticated-request";

export async function authenticate(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  try {
    // READ TOKEN FROM COOKIE (NOT HEADER)
    const token = authReq?.cookies?.auth_token;

    if (!token) {
      return reply.status(401).send({ error: "UNAUTHORIZED" });
    }

    const payload = verifyToken(token) as any;

    authReq.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    } satisfies User;
  } catch (err) {
    return reply.status(401).send({ error: "INVALID_TOKEN" });
  }
}