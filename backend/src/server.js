import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";

async function startServer() {
  try {
    await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected successfully.");

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Could not start server:", error.message);
    process.exit(1);
  }
}

startServer();
