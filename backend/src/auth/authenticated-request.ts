import { FastifyRequest } from "fastify";
import { User } from "./user.types";

export type AuthenticatedRequest = FastifyRequest & {
  user: User;
};