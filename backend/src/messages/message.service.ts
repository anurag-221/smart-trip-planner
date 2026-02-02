import { prisma } from "../lib/prisma";
import { Message } from "./message.types";

export const messageService = {
  async save(message: Message) {
    await prisma.message.create({
      data: {
        id: message.id,
        tripId: message.tripId,
        senderId: message.senderId,
        type: message.type,
        text: message.text,
        fileUrl: message.fileUrl,
        createdAt: new Date(message.timestamp),
      },
    });
  },

  async getByTrip(tripId: string): Promise<Message[]> {
    const rows = await prisma.message.findMany({
      where: { tripId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      tripId: row.tripId,
      senderId: row.senderId,
      senderName: row.sender.name,
      senderImage: row.sender.image,
      type: row.type as Message["type"],
      text: row.text ?? undefined,
      fileUrl: row.fileUrl ?? undefined,
      timestamp: row.createdAt.getTime(),
    }));
  },
};