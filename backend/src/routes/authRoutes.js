import express from "express";
import bcrypt from "bcrypt";
import { query } from "../config/db.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { generateToken } from "../utils/generateToken.js";

const router = express.Router();

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      role,
      homeCountry,
      city,
      studyProgram,
      languages,
      hobbies,
      aboutYou,
      gender,
      genderPreference,
    } = req.body;

    if (!fullName || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({
        message: "Full name, email, password, confirm password and role are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    if (!["international", "local", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role is invalid." });
    }

    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const normalizedLanguages = normalizeArray(languages);
    const normalizedHobbies = normalizeArray(hobbies);
    const buddyStatus = role === "local" ? "approved" : "not_applied";

    const insertedUser = await query(
      `INSERT INTO users (
          full_name, email, password_hash, role, home_country, city, study_program,
          languages, hobbies, about_you, gender, gender_preference, buddy_status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::text[], $9::text[], $10, $11, $12, $13)
       RETURNING id, full_name, email, role, buddy_status`,
      [
        fullName,
        email.toLowerCase(),
        passwordHash,
        role,
        homeCountry || null,
        city || null,
        studyProgram || null,
        normalizedLanguages,
        normalizedHobbies,
        aboutYou || null,
        gender || null,
        genderPreference || null,
        buddyStatus,
      ]
    );

    if (role === "local") {
      await query(
        `INSERT INTO buddy_applications (local_student_id, motivation, availability, max_buddies, status)
         VALUES ($1, $2, $3, 3, 'approved')
         ON CONFLICT DO NOTHING`,
        [insertedUser.rows[0].id, aboutYou || null, "Flexible"]
      ).catch(() => null);
    }

    return res.status(201).json({
      message: "Account created successfully. Please sign in.",
      user: insertedUser.rows[0],
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ message: "Server error while registering." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const result = await query(
      `SELECT id, full_name, email, password_hash, role, buddy_status
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user);

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        buddy_status: user.buddy_status,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Server error while logging in." });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, full_name, email, role, home_country, city, study_program,
              languages, hobbies, about_you, gender, gender_preference,
              buddy_status, profile_photo_url, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Me error:", error.message);
    return res.status(500).json({ message: "Server error while getting profile." });
  }
});

export default router;
