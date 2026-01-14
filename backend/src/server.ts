import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env";
import { authRoutes } from "./routes/auth.routes";
import { tripRoutes } from "./routes/trip.routes";
import { protectedRoutes } from "./routes/protected.routes";
import { placeRoutes } from "./routes/place.routes";
import { expenseRoutes } from "./routes/expense.routes";
import { realtimeRoutes } from "./routes/realtime.routes";
import fastifyWebsocket from "@fastify/websocket";
import { messageRoutes } from "./routes/message.routes";
import fastifyCookie from "@fastify/cookie";


// export async function authPlugin(app: FastifyInstance) {
//   app.decorateRequest("user", null);
// }


const app = Fastify({ logger: true });

async function start() {
   app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || "super-secret",
});
  await app.register(cors, {
    origin: "http://localhost:3000",
    credentials : true,
  });
  
  await app.register(fastifyWebsocket);
//   await app.register(authPlugin);
  await app.register(protectedRoutes, { prefix: "/api" });
  await app.register(authRoutes, { prefix: "/api" });
  await app.register(tripRoutes, { prefix: "/api" });
  await app.register(placeRoutes, { prefix: "/api" });
  await app.register(expenseRoutes, { prefix: "/api" });
  app.register(messageRoutes, { prefix: "/api" });
  // await app.register(wsPlugin);
  await app.register(realtimeRoutes);

  app.get("/health", async () => {
    return { status: "OK" };
  });

  await app.listen({ port: Number(env.PORT), host: "0.0.0.0" });
  console.log(`Server running on port ${env.PORT}`);
}

start();