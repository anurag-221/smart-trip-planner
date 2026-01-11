import { FastifyInstance } from "fastify";
import { authenticate } from "../middleware/authenticate";
import { authorizeTripRole } from "../middleware/authorizeTripRole";
import {
  addPlaceHandler,
  getPlacesHandler,
  reorderPlacesHandler,
  movePlaceHandler,
} from "../controllers/place.controller";

export async function placeRoutes(app: FastifyInstance) {
  app.post(
    "/trips/:tripId/places",
    {
      preHandler: [
        authenticate,
        authorizeTripRole("collaborator"),
      ],
    },
    addPlaceHandler
  );

  app.get(
    "/trips/:tripId/places",
    { preHandler: authenticate },
    getPlacesHandler
  );

  app.patch(
    "/trips/:tripId/places/reorder",
    {
      preHandler: [
        authenticate,
        authorizeTripRole("collaborator"),
      ],
    },
    reorderPlacesHandler
  );

  app.patch(
    "/trips/:tripId/places/move",
    {
      preHandler: [
        authenticate,
        authorizeTripRole("collaborator"),
      ],
    },
    movePlaceHandler
  );

}