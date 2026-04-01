import express from "express";
import { query } from "../config/db.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return null;
}

router.get("/me", authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, full_name, email, role, home_country, city, study_program,
              languages, hobbies, about_you, gender, gender_preference,
              buddy_status, profile_photo_url
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Get profile error:", error.message);
    return res.status(500).json({ message: "Could not load profile." });
  }
});

router.put("/me", authenticate, async (req, res) => {
  try {
    const {
      fullName,
      homeCountry,
      city,
      studyProgram,
      languages,
      hobbies,
      aboutYou,
      profilePhotoUrl,
      gender,
      genderPreference,
    } = req.body;

    const result = await query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           home_country = COALESCE($2, home_country),
           city = COALESCE($3, city),
           study_program = COALESCE($4, study_program),
           languages = COALESCE($5::text[], languages),
           hobbies = COALESCE($6::text[], hobbies),
           about_you = COALESCE($7, about_you),
           profile_photo_url = COALESCE($8, profile_photo_url),
           gender = COALESCE($9, gender),
           gender_preference = COALESCE($10, gender_preference),
           updated_at = NOW()
       WHERE id = $11
       RETURNING id, full_name, email, role, home_country, city, study_program,
                 languages, hobbies, about_you, gender, gender_preference,
                 buddy_status, profile_photo_url`,
      [
        fullName || null,
        homeCountry || null,
        city || null,
        studyProgram || null,
        normalizeArray(languages),
        normalizeArray(hobbies),
        aboutYou || null,
        profilePhotoUrl || null,
        gender || null,
        genderPreference || null,
        req.user.id,
      ]
    );

    return res.json({
      message: "Profile updated successfully.",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(500).json({ message: "Could not update profile." });
  }
});

export default router;
