import type { WebSocket } from "ws";
import { tripSockets } from "./socket.store";

export function broadcastToTrip(
  tripId: string,
  payload: any,
  recipientId?: string
) {
  const socketsByUserId = tripSockets.get(tripId) as
    | Map<string, WebSocket>
    | undefined;
  if (!socketsByUserId) return;

  if (recipientId) {
    const socket = socketsByUserId.get(recipientId);
    if (socket && socket.readyState === 1) {
      socket.send(JSON.stringify(payload));
    }
  } else {
    socketsByUserId.forEach((socket) => {
      if (socket.readyState === 1) {
        socket.send(JSON.stringify(payload));
      }
    });
  }
}