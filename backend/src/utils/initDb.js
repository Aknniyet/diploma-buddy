import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDb() {
  try {
    const sqlPath = path.join(__dirname, "../../database/init.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");
    await pool.query(sql);
    console.log("Database tables created successfully.");
  } catch (error) {
    console.error("Database init error:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
