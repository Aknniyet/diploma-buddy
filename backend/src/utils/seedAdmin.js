import bcrypt from "bcrypt";
import { pool } from "../config/db.js";

const ADMIN_EMAIL = "admin@kazakhbuddy.kz";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "KazakhBuddy Admin";

async function seedAdmin() {
  try {
    const existingAdmin = await pool.query(
      `SELECT id, email
       FROM users
       WHERE email = $1`,
      [ADMIN_EMAIL]
    );

    if (existingAdmin.rows.length > 0) {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`);
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await pool.query(
      `INSERT INTO users (
        full_name,
        email,
        password_hash,
        role,
        buddy_status
      )
      VALUES ($1, $2, $3, 'admin', 'not_applied')`,
      [ADMIN_NAME, ADMIN_EMAIL, passwordHash]
    );

    console.log("Admin account created successfully.");
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
  } catch (error) {
    console.error("Seed admin error:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedAdmin();
