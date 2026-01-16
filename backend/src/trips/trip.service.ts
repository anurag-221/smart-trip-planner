import { prisma } from "../lib/prisma";

export const tripService = {
  async create(name: string, ownerId: string) {
    return prisma.trip.create({
      data: {
        id: crypto.randomUUID(),
        name,
        ownerId,
      },
    });
  },

  async getAllByUser(userId: string) {
    return prisma.trip.findMany({
      where: {
        ownerId: userId, // later we’ll expand to members
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(tripId: string) {
    return prisma.trip.findUnique({
      where: { id: tripId },
    });
  },
};