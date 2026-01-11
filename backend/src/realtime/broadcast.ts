import { tripSockets } from "./socket.store";

export function broadcastToTrip(
  tripId: string,
  payload: any
) {
  const sockets = tripSockets.get(tripId);
  if (!sockets) return;

  sockets.forEach((s) => {
    s.send(JSON.stringify(payload));
  });
}