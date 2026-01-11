import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/authenticate";
import { authorizeTripRole } from "../middleware/authorizeTripRole";
import {
  createTripHandler,
  getTripHandler,
  joinTripHandler,
  approveMemberHandler,
} from "../controllers/trip.controller";

export async function tripRoutes(app: FastifyInstance) {
  app.post(
    "/trips",
    { preHandler: authenticate },
    createTripHandler
  );

  app.get("/trips/:tripId", getTripHandler);

  app.post(
    "/trips/:tripId/join",
    { preHandler: authenticate },
    joinTripHandler
  );

  app.post(
    "/trips/:tripId/members/:userId/approve",
    {
      preHandler: [
        authenticate,
        authorizeTripRole("owner"),
      ],
    },
    approveMemberHandler
  );
}