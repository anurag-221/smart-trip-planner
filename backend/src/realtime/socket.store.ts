import {WebSocket} from 'ws';

export const tripSockets = new Map<
  string,
  Set<WebSocket>
>();