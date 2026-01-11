import { FastifyInstance } from "fastify";
import { mockLogin } from "../controllers/auth.controller";
import { googleLogin } from "../controllers/googleAuth.controller";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/login", mockLogin);
  app.post("/auth/google", googleLogin);
}