import { FastifyRequest, FastifyReply } from "fastify";
// import { getUserTripRole } from "../trips/trip.service";
import { User } from "../auth/user.types";

export function authorizeTripRole(requiredRole: "owner" | "collaborator") {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    // 🔑 runtime-safe extraction
    const user = (req as any).user as User | undefined;

    if (!user) {
      return reply.status(401).send({ error: "UNAUTHORIZED" });
    }

    const { tripId } = req.params as any;
    const userId = user.id;

    // const member = getUserTripRole(tripId, userId);

    // if (!member) {
    //   return reply.status(403).send({ error: "NOT_A_MEMBER" });
    // }

    // if (requiredRole === "owner" && member.role !== "owner") {
    //   return reply.status(403).send({ error: "OWNER_ONLY" });
    // }
  };
}