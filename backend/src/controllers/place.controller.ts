import { FastifyRequest, FastifyReply } from "fastify";
import { addPlace, getPlacesByTrip, reorderPlacesInDay, movePlaceToDay } from "../places/place.service";
import { AuthenticatedRequest } from "../auth/authenticated-request";

export async function addPlaceHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;

  const { tripId } = authReq.params as any;
  const { day, name, latitude, longitude } = authReq.body as any;

  const place = addPlace({
    tripId,
    day,
    name,
    latitude,
    longitude,
    createdBy: authReq.user.id,
  });

  return reply.send(place);
}

export async function getPlacesHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { tripId } = req.params as any;
  const data = getPlacesByTrip(tripId);
  return reply.send(data);
}

export async function reorderPlacesHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { tripId } = authReq.params as any;
  const { day, orderedPlaceIds } = authReq.body as any;

  const data = reorderPlacesInDay({
    tripId,
    day,
    orderedPlaceIds,
  });

  return reply.send(data);
}

export async function movePlaceHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { tripId } = authReq.params as any;
  const { placeId, targetDay, targetOrder } = authReq.body as any;

  const data = movePlaceToDay({
    tripId,
    placeId,
    targetDay,
    targetOrder,
  });

  return reply.send(data);
}