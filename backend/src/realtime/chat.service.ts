import { broadcastToTrip } from "./broadcast";

export function sendChatMessage({
  tripId,
  userId,
  message,
}: {
  tripId: string;
  userId: string;
  message: string;
}) {
  broadcastToTrip(tripId, {
    type: "CHAT_MESSAGE",
    userId,
    message,
    timestamp: new Date().toISOString(),
  });
}