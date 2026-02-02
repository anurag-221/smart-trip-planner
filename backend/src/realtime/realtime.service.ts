import { tripSockets } from "./socket.store";
import { WebSocket } from "ws";

export const realtimeService = {
  getConnectedUsers(tripId: string) {
    const socketsByUserId = tripSockets.get(tripId);
    if (!socketsByUserId) return [];

    const connectedUsers: { userId: string; name: string }[] = [];
    socketsByUserId.forEach(({ socket, name }, userId) => {
      connectedUsers.push({ userId, name });
    });
    return connectedUsers;
  },

  disconnectUserFromTrip(tripId: string, userId: string) {
    const socketsByUserId = tripSockets.get(tripId);
    if (!socketsByUserId) return;

    const socketEntry = socketsByUserId.get(userId);
    if (socketEntry) {
      socketEntry.socket.close(1000, "You have been removed from the trip.");
      socketsByUserId.delete(userId);
      if (socketsByUserId.size === 0) {
        tripSockets.delete(tripId);
      }
    }
  },
};
