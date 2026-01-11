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