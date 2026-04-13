import bcrypt from "bcrypt";
import { pool } from "../config/db.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME ;

async function seedAdmin() {
  try {
    if (!ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_PASSWORD is missing.."
      );
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const existingAdmin = await pool.query(
      `SELECT id, email
       FROM users
       WHERE email = $1`,
      [ADMIN_EMAIL]
    );

    if (existingAdmin.rows.length > 0) {
      await pool.query(
        `UPDATE users
         SET full_name = $2,
             password_hash = $3,
             role = 'admin',
             buddy_status = 'not_applied',
             email_verified = TRUE,
             updated_at = NOW()
         WHERE email = $1`,
        [ADMIN_EMAIL, ADMIN_NAME, passwordHash]
      );

      console.log(`Admin already exists and was updated: ${ADMIN_EMAIL}`);
      console.log(`Password: ${ADMIN_PASSWORD}`);
      return;
    }

    await pool.query(
      `INSERT INTO users (
        full_name,
        email,
        password_hash,
        role,
        buddy_status,
        email_verified
      )
      VALUES ($1, $2, $3, 'admin', 'not_applied', TRUE)`,
      [ADMIN_NAME, ADMIN_EMAIL, passwordHash]
    );

    console.log("Admin account created successfully.");
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log("Password: loaded from ADMIN_PASSWORD");
  } catch (error) {
    console.error("Seed admin error:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedAdmin();
