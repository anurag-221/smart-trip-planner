import { Trip, TripRole, MemberStatus } from "./trip.types";

export const trips: Trip[] = [];
export const tripMembers: {
  tripId: string;
  userId: string;
  role: TripRole;
  status: MemberStatus;
}[] = [];