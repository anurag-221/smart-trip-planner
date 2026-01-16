import { FastifyRequest, FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../auth/authenticated-request";
import { User } from "../auth/user.types";
import { tripService } from "../trips/trip.service";

export async function createTripHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { name } = authReq.body as { name: string };

  if (!name?.trim()) {
    return reply.status(400).send({ error: "Trip name required" });
  }

  const trip = await tripService.create(name, authReq.user.id);
  reply.send(trip);
}

export async function getTripHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { tripId } = authReq.params as any;
  const trip = await tripService.getById(tripId);

  if (!trip) {
    return reply.status(404).send({ error: "TRIP_NOT_FOUND" });
  }

  return reply.send(trip);
}


export async function getAllTripsHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const trips = await tripService.getAllByUser(authReq.user.id);
  reply.send(trips);
}