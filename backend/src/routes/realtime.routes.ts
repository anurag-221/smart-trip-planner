import { FastifyInstance, FastifyRequest } from "fastify";
import type { WebSocket } from "@fastify/websocket";
import { messageService } from "../messages/message.service";

const tripSockets = new Map<string, Set<WebSocket>>();

export async function realtimeRoutes(app: FastifyInstance) {
  app.get(
    "/ws/trips/:tripId",
    { websocket: true },
    (socket: WebSocket, request: FastifyRequest) => {
      const { tripId } = request.params as { tripId: string };
      const { userId, name } = request.query as {
        userId?: string;
        name?: string;
      };

      if (!userId || !name) {
        socket.close(1008, "Missing userId or name");
        return;
      }

      if (!tripSockets.has(tripId)) {
        tripSockets.set(tripId, new Set());
      }

      const sockets = tripSockets.get(tripId)!;
      sockets.add(socket);

      // 🔔 JOIN (others only)
      sockets.forEach((client) => {
        if (client !== socket && client.readyState === 1) {
          client.send(
            JSON.stringify({
              type: "USER_JOINED",
              payload: { user: name },
            })
          );
        }
      });

      socket.on("message", async (raw) => {
        try {
          const data = JSON.parse(raw.toString());

          if (
            ![
              "CHAT_MESSAGE",
              "USER_TYPING",
              "USER_STOPPED_TYPING",
              "MESSAGE_SEEN",
            ].includes(data.type)
          ) {
            return;
          }

          // 👁 Seen
          if (data.type === "MESSAGE_SEEN") {
            sockets.forEach((client) => {
              if (client.readyState === 1) {
                client.send(JSON.stringify(data));
              }
            });
            return;
          }

          // 💬 Chat message
          if (data.type === "CHAT_MESSAGE") {
            const message = {
              id: data.payload.id,
              tripId,
              senderId: userId,
              senderName: name,
              type: "text" as const,
              text: data.payload.text,
              fileUrl: undefined,
              timestamp: Date.now(),
            };

            await messageService.save(message);

            sockets.forEach((client) => {
              if (client.readyState === 1) {
                client.send(
                  JSON.stringify({
                    type: "CHAT_MESSAGE",
                    payload: message,
                  })
                );
              }
            });
            return;
          }

          // ✍ Typing
          sockets.forEach((client) => {
            if (client !== socket && client.readyState === 1) {
              client.send(JSON.stringify(data));
            }
          });
        } catch (err) {
          console.error("❌ WS handler crashed", err);
        }
      });

      socket.on("close", () => {
        sockets.delete(socket);

        sockets.forEach((client) => {
          if (client.readyState === 1) {
            client.send(
              JSON.stringify({
                type: "USER_LEFT",
                payload: { user: name },
              })
            );
          }
        });
      });
    }
  );
}