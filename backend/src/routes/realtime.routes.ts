import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { WebSocket } from "@fastify/websocket";
import { messageService } from "../messages/message.service";
import { tripSockets } from "../realtime/socket.store";
import { realtimeService } from "../realtime/realtime.service";

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
        tripSockets.set(tripId, new Map());
      }

      const socketsByUserId = tripSockets.get(tripId)!;
      socketsByUserId.set(userId, { socket, name });

      // 🔔 JOIN (others only)
      socketsByUserId.forEach((client, clientUserId) => {
        if (clientUserId !== userId && client.socket.readyState === 1) {
          client.socket.send(
            JSON.stringify({
              type: "USER_JOINED",
              payload: { userId, name },
            })
          );
        }
      });

      socket.on("message", async (raw: any) => {
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
            socketsByUserId.forEach((client) => {
              if (client.socket.readyState === 1) {
                client.socket.send(JSON.stringify(data));
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

            socketsByUserId.forEach((client) => {
              if (client.socket.readyState === 1) {
                client.socket.send(
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
          socketsByUserId.forEach((client, clientUserId) => {
            if (clientUserId !== userId && client.socket.readyState === 1) {
              client.socket.send(JSON.stringify(data));
            }
          });
        } catch (err) {
          console.error("❌ WS handler crashed", err);
        }
      });

      socket.on("close", () => {
        socketsByUserId.delete(userId);

        socketsByUserId.forEach((client) => {
          if (client.socket.readyState === 1) {
            client.socket.send(
              JSON.stringify({
                type: "USER_LEFT",
                payload: { userId, name },
              })
            );
          }
        });
      });
    }
  );

  // HTTP endpoint (no /api prefix) for connected users; used internally by API route
  app.get(
    "/trips/:tripId/connected-users",
    async (req: FastifyRequest, reply: FastifyReply) => {
      const { tripId } = req.params as { tripId: string };
      const connectedUsers = realtimeService.getConnectedUsers(tripId);
      return reply.send(connectedUsers);
    }
  );
}

