import { WebSocket } from "ws";

// tripId -> (userId -> { socket, name })
export const tripSockets: Map<string, Map<string, { socket: WebSocket; name: string }>> = new Map();
