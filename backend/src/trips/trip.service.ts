import { prisma } from "../lib/prisma";
import { broadcastToTrip } from "../realtime/broadcast";
import { notificationService } from "../notifications/notification.service";
import { User } from "../auth/user.types";

const TripRole = { OWNER: "OWNER" as const, MEMBER: "MEMBER" as const };
const JoinStatus = {
  PENDING: "PENDING" as const,
  APPROVED: "APPROVED" as const,
  DECLINED: "DECLINED" as const,
};


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
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });
  },

  async getMembers(tripId: string) {
    return prisma.tripMember.findMany({
      where: { tripId, status: JoinStatus.APPROVED },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    });
  },

  async approveMember(tripId: string, userId: string) {
  const existing = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId } },
  });

  if (!existing || existing.status === JoinStatus.APPROVED) {
    return existing;
  }

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { name: true } });
  const tripName = trip?.name || "Unknown Trip";

  const member = await prisma.tripMember.update({
    where: { tripId_userId: { tripId, userId } },
    data: { status: JoinStatus.APPROVED },
    include: { user: true },
  });

  broadcastToTrip(tripId, {
    type: "MEMBER_APPROVED",
    payload: {
      tripId,
      userId,
      user: member.user,
    },
  });

  await notificationService.create({
    userId: userId,
    tripId: tripId,
    type: "MEMBER_APPROVED",
    message: `Your request to join trip ${tripName} has been approved.`,
  });

  return member;
},

  async declineMember(tripId: string, userId: string) {
  const member = await prisma.tripMember.update({
    where: { tripId_userId: { tripId, userId } },
    data: { status: JoinStatus.DECLINED },
    include: { user: true },
  });

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { name: true } });
  const tripName = trip?.name || "Unknown Trip";

  // 🔔 realtime + notification event
  broadcastToTrip(tripId, {
    type: "MEMBER_DECLINED",
    payload: {
      tripId,
      userId,
      user: member.user,
    },
  });

  await notificationService.create({
    userId: userId,
    tripId: tripId,
    type: "MEMBER_DECLINED",
    message: `Your request to join trip ${tripName} has been declined.`,
  });

  return member;
},

async reRequestMember(tripId: string, userId: string) {
  const member = await prisma.tripMember.update({
    where: { tripId_userId: { tripId, userId } },
    data: { status: JoinStatus.PENDING },
    include: { user: true },
  });

  broadcastToTrip(tripId, {
    type: "MEMBER_RE_REQUESTED",
    payload: {
      tripId,
      userId,
      user: member.user,
    },
  });

  return member;
},

  async removeMember(tripId: string, userId: string) {
    try {
      const removedMember = await prisma.tripMember.delete({
        where: { tripId_userId: { tripId, userId } },
        include: { user: true },
      });

      const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { name: true } });
      const tripName = trip?.name || "Unknown Trip";


      broadcastToTrip(tripId, {
        type: "MEMBER_REMOVED",
        payload: {
          tripId,
          userId,
          name: removedMember.user.name,
          tripName
        },
      });

      await notificationService.create({
        userId: userId,
        tripId: tripId,
        type: "MEMBER_REMOVED",
        message: `You have been removed from trip ${tripName}.`,
      });

      return removedMember;
    } catch (error: any) {
      if (error.code === 'P2025') {
        // Record not found, so they are already removed.
        return null;
      }
      throw error;
    }
  },
};
