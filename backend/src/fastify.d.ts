import "fastify";
import "@fastify/oauth2"
import { OAuth2Namespace } from "@fastify/oauth2";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      email: string;
      name: string;
    } | null;
  }
    interface FastifyReply {
    setCookie: (
      name: string,
      value: string,
      options?: {
        path?: string;
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: "lax" | "strict" | "none";
        maxAge?: number;
      }
    ) => FastifyReply;
  }
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
  }
}