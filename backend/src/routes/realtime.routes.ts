import { FastifyInstance } from "fastify";
import WebSocket from "ws";

const tripSockets = new Map<string, Set<WebSocket>>();

export async function realtimeRoutes(app: FastifyInstance) {
  app.get(
    "/ws/trips/:tripId",
    { websocket: true },
    (socket, request) => {
      const { tripId } = request.params as any;

      if (!tripSockets.has(tripId)) {
        tripSockets.set(tripId, new Set());
      }

      const sockets = tripSockets.get(tripId)!;
      sockets.add(socket);

      socket.on("message", (msg) => {
        // broadcast to all in same trip
        sockets.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(msg.toString());
          }
        });
      });

      socket.on("close", () => {
        sockets.delete(socket);
      });
    }
  );
}