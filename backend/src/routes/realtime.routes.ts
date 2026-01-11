import { FastifyInstance, FastifyRequest } from "fastify";
import { WebSocket } from "ws";
import { tripSockets } from "../realtime/socket.store";

export async function realtimeRoutes(app: FastifyInstance) {
  app.get(
    "/ws/trips/:tripId",
    { websocket: true } as any,
    ((socket: WebSocket, request: FastifyRequest) => {
      const { tripId } = request.params as { tripId: string };

      if (!tripSockets.has(tripId)) {
        tripSockets.set(tripId, new Set());
      }

      const sockets = tripSockets.get(tripId)!;
      sockets.add(socket);

      sockets.forEach((s) =>
        s.send(
          JSON.stringify({
            type: "USER_JOINED",
            tripId,
          })
        )
      );

      socket.on("close", () => {
        sockets.delete(socket);
      });
    }) as any // 🔑 THIS is the missing piece
  );
}