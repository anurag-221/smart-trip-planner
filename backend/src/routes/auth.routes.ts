import { FastifyInstance } from "fastify";
import { mockLogin, updateProfile, getMe } from "../controllers/auth.controller";
import { googleLogin } from "../controllers/googleAuth.controller";
import { authenticate } from "../middleware/authenticate";
import { AuthenticatedRequest } from "../auth/authenticated-request";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", mockLogin);
  app.get("/auth/google/callback", googleLogin);
  app.get("/auth/me", { preHandler: authenticate }, getMe);

  app.put("/auth/profile", { preHandler: authenticate }, updateProfile);
  app.post("/auth/logout", async (_req, reply) => {
  reply
    .clearCookie("auth_token", {
      path: "/",
    })
    .send({ success: true });
});
}