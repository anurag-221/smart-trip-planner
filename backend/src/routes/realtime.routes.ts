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

      // ✅ SEND JOIN EVENT ONLY TO *OTHERS*
      sockets.forEach((client) => {
        if (
          client !== socket &&
          client.readyState === WebSocket.OPEN
        ) {
          client.send(
            JSON.stringify({
              type: "USER_JOINED",
              payload: { user: "Someone" },
            })
          );
        }
      });

      socket.on("message", (raw) => {
        let data;
        try {
          data = JSON.parse(raw.toString());
        } catch {
          return;
        }

        if (
    ![
      "CHAT_MESSAGE",
      "USER_TYPING",
      "USER_STOPPED_TYPING",
    ].includes(data.type)
  ) {
    return;
  }

  sockets.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client !== socket // 👈 don't echo typing back
    ) {
      client.send(JSON.stringify(data));
    }
  });
      });

      socket.on("close", () => {
        sockets.delete(socket);

        // ✅ SEND LEAVE EVENT ONLY TO *OTHERS*
        sockets.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "USER_LEFT",
                payload: { user: "Someone" },
              })
            );
          }
        });
      });
    }
  );
}