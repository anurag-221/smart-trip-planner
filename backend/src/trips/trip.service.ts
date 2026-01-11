import { v4 as uuid } from "uuid";
import { trips, tripMembers } from "./trip.store";
import { Trip } from "./trip.types";

export function createTrip({
  title,
  startDate,
  endDate,
  isPublic,
  ownerId,
}: {
  title: string;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  ownerId: string;
}): Trip {
  const trip: Trip = {
    id: uuid(),
    title,
    startDate,
    endDate,
    ownerId,
    isPublic,
  };

  trips.push(trip);

  tripMembers.push({
    tripId: trip.id,
    userId: ownerId,
    role: "owner",
    status: "approved",
  });

  return trip;
}

export function getTrip(tripId: string) {
  return trips.find((t) => t.id === tripId);
}

export function getUserTripRole(tripId: string, userId: string) {
  return tripMembers.find(
    (m) =>
      m.tripId === tripId &&
      m.userId === userId &&
      m.status === "approved"
  );
}

export function requestToJoinTrip(tripId: string, userId: string) {
  const exists = tripMembers.find(
    (m) => m.tripId === tripId && m.userId === userId
  );
  if (exists) {
    throw new Error("REQUEST_ALREADY_EXISTS");
  }

  tripMembers.push({
    tripId,
    userId,
    role: "viewer",
    status: "pending",
  });
}

export function approveMember(tripId: string, userId: string) {
  const member = tripMembers.find(
    (m) => m.tripId === tripId && m.userId === userId
  );
  if (!member) throw new Error("MEMBER_NOT_FOUND");

  member.status = "approved";
  member.role = "collaborator";
}