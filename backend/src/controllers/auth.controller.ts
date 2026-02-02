import { FastifyRequest, FastifyReply } from "fastify";
import "@fastify/cookie"; // Fixes setCookie type
import { signToken } from "../auth/jwt";
import { prisma } from "../lib/prisma";

export async function mockLogin(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { email, name } = req.body as any;

  if (!email || !name) {
    return reply.status(400).send({ error: "INVALID_INPUT" });
  }

  const user = {
    id: email,
    email,
    name,
  };

  const token = signToken(user);

  return reply
    .setCookie("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false,
    })
    .send({ user });
}

export async function updateProfile(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as any; // authenticated
  const { name, image } = req.body as { name?: string; image?: string };
  const userId = authReq.user.id;

  try {
    const data: any = {};
    if (name) data.name = name;
    if (image !== undefined) data.image = image; // Allow clearing image if empty string sent?

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return reply.send({ user: updatedUser });
  } catch (error) {
    console.error("Profile update error:", error);
    return reply.status(500).send({ error: "Failed to update profile" });
  }
}

export async function getMe(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as any;
  try {
      const user = await prisma.user.findUnique({
          where: { id: authReq.user.id }
      });
      
      if (!user) {
          return reply.status(404).send({ error: "User not found" });
      }

      return reply.send({ user });
  } catch (error) {
      console.error("Get me error:", error);
      return reply.status(500).send({ error: "Failed to fetch user" });
  }
}