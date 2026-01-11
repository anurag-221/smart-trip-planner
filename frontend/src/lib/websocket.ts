export function connectTripSocket(tripId: string): WebSocket {
  const wsUrl = `ws://localhost:5000/ws/trips/${tripId}`;
  return new WebSocket(wsUrl);
}