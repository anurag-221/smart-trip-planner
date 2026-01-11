import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/authenticate";
import { AuthenticatedRequest } from "../auth/authenticated-request";

export async function protectedRoutes(app: FastifyInstance) {
  app.get(
    "/protected",
    { preHandler: authenticate },
    async (req) => {
          const authReq = req as AuthenticatedRequest;
      return {
        message: "You are authenticated",
        user: authReq.user,
      };
    }
  );
}