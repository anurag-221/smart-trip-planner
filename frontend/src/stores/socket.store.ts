import { create } from "zustand";

export const useSocketStore = create<{
  socket: WebSocket | null;
  connect: (tripId: string, cb: (d: any) => void) => void;
}>((set) => ({
  socket: null,
  connect: (tripId, cb) => {
    const ws = new WebSocket(
      `ws://localhost:5000/ws/trips/${tripId}`
    );
    ws.onmessage = (e) => cb(JSON.parse(e.data));
    set({ socket: ws });
  },
}));