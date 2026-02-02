import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/authenticate";
import { realtimeService } from "../realtime/realtime.service";
import {
  createTripHandler,
  getTripHandler,
  getAllTripsHandler,
  getInviteLinkHandler,
  joinByTokenHandler,
  getPendingMembersHandler,
  approveMemberHandler,
  declineMemberHandler,
  removeMemberHandler,
  getMembersHandler,
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

  // Expose connected users under /api prefix
  app.get(
    "/trips/:tripId/connected-users",
    { preHandler: authenticate },
    async (req, reply) => {
      const { tripId } = req.params as any;
      const users = realtimeService.getConnectedUsers(tripId);
      return reply.send(users);
    }
  );

  app.get(
    "/trips/:tripId/invite",
    { preHandler: authenticate },
    getInviteLinkHandler
  );

   app.post(
  "/trips/join",
  { preHandler: authenticate },
  joinByTokenHandler
);

  app.get(
    "/trips/:tripId/members/pending",
    { preHandler: authenticate },
    getPendingMembersHandler
  );

  app.get(
    "/trips/:tripId/members",
    { preHandler: authenticate },
    getMembersHandler
  );

  app.post(
    "/trips/:tripId/members/:userId/approve",
    { preHandler: authenticate },
    approveMemberHandler
  );

  app.post(
    "/trips/:tripId/members/:userId/decline",
    { preHandler: authenticate },
    declineMemberHandler
  );

  app.post(
    "/trips/:tripId/members/:userId/remove",
    { preHandler: authenticate },
    removeMemberHandler
  );
}