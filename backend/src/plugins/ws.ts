import { FastifyInstance } from "fastify";
import websocket from "@fastify/websocket";

export async function wsPlugin(app: FastifyInstance) {
  app.register(websocket);
}