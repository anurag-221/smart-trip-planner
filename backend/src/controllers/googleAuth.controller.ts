import { FastifyRequest, FastifyReply } from "fastify";
import { verifyGoogleToken } from "../auth/google";
import { signToken } from "../auth/jwt";

export async function googleLogin(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { idToken } = req.body as { idToken: string };

  if (!idToken) {
    return reply.status(400).send({ error: "TOKEN_REQUIRED" });
  }

  try {
    const googleUser = await verifyGoogleToken(idToken);

    // Later: find or create user in DB
    const user = {
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
    };

    const token = signToken(user);

    return reply.send({ token, user });
  } catch (err) {
    return reply.status(401).send({ error: "INVALID_GOOGLE_TOKEN" });
  }
}