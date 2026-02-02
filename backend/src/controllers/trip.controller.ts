import { FastifyRequest, FastifyReply } from "fastify";
import { AuthenticatedRequest } from "../auth/authenticated-request";
import { tripService } from "../trips/trip.service";
import { signInviteToken, verifyInviteToken } from "../auth/jwt";
import { env } from "../config/env";
import { realtimeService } from "../realtime/realtime.service";
import { notificationService } from "../notifications/notification.service";
import { broadcastToTrip } from "../realtime/broadcast";

export async function createTripHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { name } = authReq.body as { name: string };

  if (!name?.trim()) {
    return reply.status(400).send({ error: "Trip name required" });
  }

  // Ensure the user exists before creating a trip
  await tripService.createOrFindUser(authReq.user);

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

  const canAccess = await tripService.canAccessTrip(tripId, authReq.user.id);
  if (!canAccess) {
    return reply.status(403).send({ error: "FORBIDDEN" });
  }

  return reply.send(trip);
}

export async function getInviteLinkHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { tripId } = authReq.params as any;

  const canAccess = await tripService.canAccessTrip(tripId, authReq.user.id);
  if (!canAccess) {
    return reply.status(403).send({ error: "FORBIDDEN" });
  }

  const token = signInviteToken({
    tripId,
    inviterUserId: authReq.user.id,
  });
  const inviteUrl = `${env.APP_URL}/invite/${token}`;
  return reply.send({ inviteUrl, token });
}

export async function joinByTokenHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { token } = authReq.body as { token: string }; // <-- from body now

  if (!token) {
    return reply.status(400).send({ error: "TOKEN_REQUIRED" });
  }

  let payload: { tripId: string; inviterUserId: string };
  try {
    payload = verifyInviteToken(token);
  } catch {
    return reply.status(400).send({ error: "INVALID_OR_EXPIRED_INVITE" });
  }

  const { tripId, inviterUserId } = payload;
  const trip = await tripService.getById(tripId);
  if (!trip) {
    return reply.status(404).send({ error: "TRIP_NOT_FOUND" });
  }

  await tripService.createOrFindUser(authReq.user);

  const existing = await tripService.getMember(tripId, authReq.user.id);
  if (existing?.status === "APPROVED") {
    return reply.send({ tripId, status: "already_joined" });
  }

  const inviterIsOwner = await tripService.isOwner(tripId, inviterUserId);
  const status = inviterIsOwner ? "APPROVED" : "PENDING";

  await tripService.addMember(tripId, authReq.user.id, "MEMBER", status);

  return reply.send({
    tripId,
    status: inviterIsOwner ? "joined" : "pending_approval",
  });
}

export async function getPendingMembersHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { tripId } = authReq.params as any;

  const isOwner = await tripService.isOwner(tripId, authReq.user.id);
  if (!isOwner) {
    return reply.status(403).send({ error: "OWNER_ONLY" });
  }

  const pending = await tripService.getPendingMembers(tripId);
  return reply.send(pending);
}

export async function getMembersHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { tripId } = authReq.params as any;

  const canAccess = await tripService.canAccessTrip(tripId, authReq.user.id);
  if (!canAccess) {
    return reply.status(403).send({ error: "FORBIDDEN" });
  }

  const members = await tripService.getMembers(tripId);
  return reply.send(members);
}

export async function approveMemberHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { tripId, userId } = authReq.params as any;

  const isOwner = await tripService.isOwner(tripId, authReq.user.id);
  if (!isOwner) {
    return reply.status(403).send({ error: "OWNER_ONLY" });
  }

  await tripService.approveMember(tripId, userId);
  return reply.send({ success: true });
}

export async function declineMemberHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { tripId, userId } = authReq.params as any;

  const isOwner = await tripService.isOwner(tripId, authReq.user.id);
  if (!isOwner) {
    return reply.status(403).send({ error: "OWNER_ONLY" });
  }

  await tripService.declineMember(tripId, userId);
  return reply.send({ success: true });
}

export async function removeMemberHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const { tripId, userId } = authReq.params as any;

  const isOwner = await tripService.isOwner(tripId, authReq.user.id);
  if (!isOwner) {
    return reply.status(403).send({ error: "OWNER_ONLY" });
  }

  // Remove from DB (handles broadcast and notification internally)
  await tripService.removeMember(tripId, userId);

  // Disconnect from WebSocket (if connected)
  realtimeService.disconnectUserFromTrip(tripId, userId);

  return reply.send({ success: true });
}

export async function getAllTripsHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const authReq = req as AuthenticatedRequest;
  const trips = await tripService.getAllByUser(authReq.user.id);
  reply.send(trips);
}