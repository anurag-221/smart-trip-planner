import { FastifyRequest, FastifyReply } from "fastify";
import { signToken } from "../auth/jwt";

export async function mockLogin(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { email, name } = req.body as any;

  if (!email || !name) {
    return reply.status(400).send({ error: "INVALID_INPUT" });
  }

  const user = {
    id: email, // temp
    email,
    name,
  };

  const token = signToken(user);

  return reply.send({ token, user });
}