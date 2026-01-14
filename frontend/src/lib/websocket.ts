export function connectTripSocket(tripId: string, me: { user : {id: string; name: string }}): WebSocket {
  const wsUrl = `ws://localhost:5000/ws/trips/${tripId}?userId=${me.user.id}&name=${me.user.name}`;
  return new WebSocket(wsUrl);
}