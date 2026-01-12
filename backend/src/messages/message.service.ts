import { Message } from "./message.types";

const messagesByTrip = new Map<string, Message[]>();

export const messageService = {
  save(message: Message) {
    if (!messagesByTrip.has(message.tripId)) {
      messagesByTrip.set(message.tripId, []);
    }

    messagesByTrip.get(message.tripId)!.push(message);
  },

  getByTrip(tripId: string): Message[] {
    return messagesByTrip.get(tripId) || [];
  },
};