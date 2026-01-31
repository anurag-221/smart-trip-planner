import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/authenticate";
import {
  createTripHandler,
  getTripHandler,
  getAllTripsHandler,
  getInviteLinkHandler,
  joinByTokenHandler,
  getPendingMembersHandler,
  approveMemberHandler,
} from "../controllers/trip.controller";

export async function tripRoutes(app: FastifyInstance) {
  app.post(
    "/trips",
    { preHandler: authenticate },
    createTripHandler
  );

  app.get(
    "/trips",
    { preHandler: authenticate },
    getAllTripsHandler
  );

  app.get(
    "/trips/:tripId",
    { preHandler: authenticate },
    getTripHandler
  );

  app.get(
    "/trips/:tripId/invite",
    { preHandler: authenticate },
    getInviteLinkHandler
  );

    app.post(
    "/trips/join/:token",
    { preHandler: authenticate },
    joinByTokenHandler
  );

  app.get(
    "/trips/:tripId/members/pending",
    { preHandler: authenticate },
    getPendingMembersHandler
  );

  app.post(
    "/trips/:tripId/members/:userId/approve",
    { preHandler: authenticate },
    approveMemberHandler
  );
}