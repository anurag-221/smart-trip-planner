import { FastifyRequest, FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../auth/authenticated-request";
import {
  createTrip,
  getTrip,
  requestToJoinTrip,
  approveMember,
} from "../trips/trip.service";
import { User } from "../auth/user.types";

export async function createTripHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { title, startDate, endDate, isPublic } = authReq.body as any;

  const trip = createTrip({
    title,
    startDate,
    endDate,
    isPublic,
    ownerId: authReq.user!.id,
  });

  return reply.send(trip);
}

export async function getTripHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
    const authReq = req as AuthenticatedRequest;
  const { tripId } = authReq.params as any;
  const trip = getTrip(tripId);

  if (!trip) {
    return reply.status(404).send({ error: "TRIP_NOT_FOUND" });
  }

  if (!trip.isPublic && !authReq?.user) {
    return reply.status(403).send({ error: "LOGIN_REQUIRED" });
  }

  return reply.send(trip);
}

export async function joinTripHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
    const authReq = req as AuthenticatedRequest;

  const { tripId } = authReq.params as any;
  requestToJoinTrip(tripId, authReq?.user!.id);
  return reply.send({ status: "REQUEST_SENT" });
}

export async function approveMemberHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
    const authReq = req as AuthenticatedRequest;

  const { tripId, userId } = authReq.params as any;
  approveMember(tripId, userId);
  return reply.send({ status: "APPROVED" });
}

export async function getAllTripsHandler(req: any) {
  const userId = req.user?.id;

  // TEMP: return all trips for now
  // Later filter by membership
  return req.server.trips || [];
}