import { prisma } from "../lib/prisma";
import { broadcastToTrip } from "../realtime/broadcast";
import { User } from "../auth/user.types";

const TripRole = { OWNER: "OWNER" as const, MEMBER: "MEMBER" as const };
const JoinStatus = { PENDING: "PENDING" as const, APPROVED: "APPROVED" as const };

export const tripService = {
  async createOrFindUser(userData: User) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userData.id },
    });

    if (existingUser) {
      return existingUser;
    }

    return prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
    });
  },

  async create(name: string, ownerId: string) {
    const trip = await prisma.trip.create({
      data: {
        id: crypto.randomUUID(),
        name,
        ownerId,
      },
    });
    await prisma.tripMember.create({
      data: {
        tripId: trip.id,
        userId: ownerId,
        role: TripRole.OWNER,
        status: JoinStatus.APPROVED,
      },
    });
    return trip;
  },

  async getAllByUser(userId: string) {
    return prisma.trip.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: { userId, status: JoinStatus.APPROVED },
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(tripId: string) {
    return prisma.trip.findUnique({
      where: { id: tripId },
    });
  },

  async getMember(tripId: string, userId: string) {
    return prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId } },
    });
  },

  async isOwner(tripId: string, userId: string): Promise<boolean> {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { ownerId: true },
    });
    return trip?.ownerId === userId;
  },

  async canAccessTrip(tripId: string, userId: string): Promise<boolean> {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { ownerId: true, members: { where: { userId }, select: { status: true } } },
    });
    if (!trip) return false;
    if (trip.ownerId === userId) return true;
    return trip.members.some((m: { status: string; }) => m.status === JoinStatus.APPROVED);
  },

  async addMember(
    tripId: string,
    userId: string,
    role: "OWNER" | "MEMBER",
    status: "PENDING" | "APPROVED"
  ) {
    return prisma.tripMember.upsert({
      where: { tripId_userId: { tripId, userId } },
      update: { status, role },
      create: {
        tripId,
        userId,
        role,
        status,
      },
    });
  },

  async getPendingMembers(tripId: string) {
    return prisma.tripMember.findMany({
      where: { tripId, status: JoinStatus.PENDING },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },

  async approveMember(tripId: string, userId: string) {
    return prisma.tripMember.update({
      where: { tripId_userId: { tripId, userId } },
      data: { status: JoinStatus.APPROVED },
    });
  },
};
