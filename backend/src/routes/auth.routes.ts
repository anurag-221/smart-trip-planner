import { FastifyInstance } from "fastify";
import { mockLogin } from "../controllers/auth.controller";
import { googleLogin } from "../controllers/googleAuth.controller";
import { authenticate } from "../middleware/authenticate";
import { AuthenticatedRequest } from "../auth/authenticated-request";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", mockLogin);
  app.post("/auth/google", googleLogin);
  app.get(
    "/auth/me",
    { preHandler: authenticate },
    async (req, reply) => {
      const authReq = req as AuthenticatedRequest;
      reply.send({ user: authReq.user });
    }
  );
}