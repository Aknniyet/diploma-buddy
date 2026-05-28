import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { updateLastActiveAt } from "../repositories/userRepository.js";
import { ensurePlatformEnhancements } from "../services/platformSetupService.js";

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token is missing." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    await ensurePlatformEnhancements();
    req.user = decoded;
    updateLastActiveAt(decoded.id).catch(() => null);
    next();
  } catch {
    return res.status(401).json({ message: "Token is invalid or expired." });
  }
}
