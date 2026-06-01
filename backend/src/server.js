import { createServer } from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";
import { migrateLegacyMessageEncryption } from "./services/messageEncryptionMigration.js";
import { createRealtimeServer } from "./services/realtimeService.js";

async function startServer() {
  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected successfully.");
    await migrateLegacyMessageEncryption();

    const server = createServer(app);
    createRealtimeServer(server);

    server.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
      console.log(`Realtime server ready on ws://localhost:${env.port}/ws`);
    });
  } catch (error) {
    console.error("Could not start server:", error.message);
    process.exit(1);
  }
}

startServer();
