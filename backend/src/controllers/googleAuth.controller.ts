import { FastifyRequest, FastifyReply } from "fastify";
import { signToken } from "../auth/jwt";
import { prisma } from "../lib/prisma";

export async function googleLogin(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const oauth = req.server as typeof req.server & {
  googleOAuth2: import("@fastify/oauth2").OAuth2Namespace;
};

const token =
  await oauth.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);

  const userInfo = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${token.token.access_token}`,
      },
    }
  ).then((r) => r.json());

  const { email, name } = userInfo;

  if (!email) {
    return reply.status(400).send({ error: "GOOGLE_AUTH_FAILED" });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: {
      id: email,
      email,
      name,
    },
  });

  const jwt = signToken({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  reply
    .setCookie("auth_token", jwt, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    })
    .redirect("http://localhost:3000/trips");
}
