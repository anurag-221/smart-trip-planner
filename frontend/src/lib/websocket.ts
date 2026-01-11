export function connectTripSocket(
  tripId: string,
  onMessage: (data: any) => void
) {
  const ws = new WebSocket(`ws://localhost:5000/ws/trips/${tripId}`);

  ws.onmessage = (e) => {
    onMessage(JSON.parse(e.data));
  };

  return ws;
}