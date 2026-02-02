import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env";
import { authRoutes } from "./routes/auth.routes";
import { tripRoutes } from "./routes/trip.routes";
import { protectedRoutes } from "./routes/protected.routes";
import { placeRoutes } from "./routes/place.routes";
import { expenseRoutes } from "./routes/expense.routes";
import { realtimeRoutes } from "./routes/realtime.routes";
import { notificationRoutes } from "./routes/notification.routes";
import fastifyWebsocket from "@fastify/websocket";
import { messageRoutes } from "./routes/message.routes";
import fastifyCookie from "@fastify/cookie";
import fastifyOauth2 from "@fastify/oauth2";

const app = Fastify({ logger: true });

async function start() {
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || "super-secret",
  });


  await app.register(cors, {
    origin: "http://localhost:3000",
    credentials : true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  await app.register(fastifyOauth2, {
        name: "googleOAuth2",
        scope: ["profile", "email"],
        credentials: {
          client: {
            id: process.env.GOOGLE_CLIENT_ID!,
            secret: process.env.GOOGLE_CLIENT_SECRET!,
          },
          auth: fastifyOauth2.GOOGLE_CONFIGURATION,
        },
        startRedirectPath: "/api/auth/google",
        callbackUri: "http://localhost:5000/api/auth/google/callback",
      });


  // await app.register(googleOAuthPlugin);

  
  await app.register(protectedRoutes, { prefix: "/api" });
  await app.register(authRoutes, { prefix: "/api" });
  await app.register(tripRoutes, { prefix: "/api" });
  await app.register(placeRoutes, { prefix: "/api" });
  await app.register(expenseRoutes, { prefix: "/api" });
  app.register(messageRoutes, { prefix: "/api" });
  await app.register(notificationRoutes, { prefix: "/api" });


  await app.register(fastifyWebsocket);
  await app.register(realtimeRoutes);

  app.get("/health", async () => {
    return { status: "OK" };
  });

  await app.listen({ port: Number(env.PORT), host: "0.0.0.0" });
  console.log(`Server running on port ${env.PORT}`);
}

start();