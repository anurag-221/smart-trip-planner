import { FastifyInstance } from "fastify";

export async function authPlugin(app: FastifyInstance) {
  app.decorateRequest("user", null);
}