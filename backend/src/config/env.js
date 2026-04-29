import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

export const env = {
  port: Number(process.env.PORT) || 5001,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/buddy_project",
  jwtSecret: process.env.JWT_SECRET || "super_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  emailUser: process.env.EMAIL_USER || "",
  emailPass: process.env.EMAIL_PASS || "",
  emailFrom: process.env.EMAIL_FROM || process.env.EMAIL_USER || "",
};
