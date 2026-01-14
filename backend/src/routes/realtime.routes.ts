import { FastifyInstance } from "fastify";
import WebSocket from "ws";
import { messageService } from "../messages/message.service";

const tripSockets = new Map<string, Set<WebSocket>>();

export async function realtimeRoutes(app: FastifyInstance) {
  app.get(
    "/ws/trips/:tripId",
    { websocket: true },
    (socket, request) => {
      const { tripId } = request.params as any;
      const {userId, name } = request.query as {userId: string; name: string};

      if(!userId || !name ){
        socket.close(1008, `Missing userId or name`);
        return;
      }

      if (!tripSockets.has(tripId)) {
        tripSockets.set(tripId, new Set());
      }

      const sockets = tripSockets.get(tripId)!;
      sockets.add(socket);

      // SEND JOIN EVENT ONLY TO *OTHERS*
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

          if (data.type === "MESSAGE_SEEN") {
            sockets.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
              }
            });
            return;
          }

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

            // persist
            await messageService.save(message);

            // broadcast canonical message
            sockets.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
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


          // Typing events
          sockets.forEach((client) => {
            if (
              client.readyState === WebSocket.OPEN &&
              client !== socket
            ) {
              client.send(JSON.stringify(data));
            }
          });
        } catch (err) {
          console.error("WS handler crashed", err);
        }
      });

      socket.on("close", () => {
        sockets.delete(socket);

        // SEND LEAVE EVENT ONLY TO *OTHERS*
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