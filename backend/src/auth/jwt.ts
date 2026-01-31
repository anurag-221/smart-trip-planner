import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "./user.types";

export function signToken(user: User) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET);
}

export type InvitePayload = { tripId: string; inviterUserId: string };

export function signInviteToken(payload: InvitePayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "30d" });
}

export function verifyInviteToken(token: string): InvitePayload {
  return jwt.verify(token, env.JWT_SECRET) as InvitePayload;
}