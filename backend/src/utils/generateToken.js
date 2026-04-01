import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      buddy_status: user.buddy_status,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}
