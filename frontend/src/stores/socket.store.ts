import { create } from "zustand";

export const useSocketStore = create<{
  socket: WebSocket | null;
  connect: (tripId: string, userId: string, name: string, cb: (d: any) => void) => void;
}>((set) => ({
  socket: null,
  connect: (tripId, userId, name, cb) => {
    const ws = new WebSocket(
      `ws://localhost:5000/ws/trips/${tripId}?userId=${encodeURIComponent(userId)}&name=${encodeURIComponent(name)}`
    );
    ws.onmessage = (e) => cb(JSON.parse(e.data));
    set({ socket: ws });
  },
}));