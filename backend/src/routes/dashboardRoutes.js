import express from "express";
import { query } from "../config/db.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/student", authenticate, async (req, res) => {
  try {
    const [matchResult, requestResult, unreadResult, profileResult, checklistResult] = await Promise.all([
      query(
        `SELECT b.full_name, b.study_program, b.profile_photo_url
         FROM buddy_matches bm
         JOIN users b ON b.id = bm.buddy_id
         WHERE bm.international_student_id = $1 AND bm.status = 'active'`,
        [req.user.id]
      ),
      query(
        `SELECT COUNT(*)::int AS count FROM buddy_requests WHERE international_student_id = $1 AND status = 'pending'`,
        [req.user.id]
      ),
      query(
        `SELECT COUNT(m.id)::int AS count
         FROM conversations c
         JOIN messages m ON m.conversation_id = c.id
         WHERE (c.international_student_id = $1 OR c.buddy_id = $1)
           AND m.sender_id <> $1 AND m.is_read = FALSE`,
        [req.user.id]
      ),
      query(
        `SELECT full_name, email, home_country, city, study_program, languages, hobbies, about_you, gender, gender_preference
         FROM users
         WHERE id = $1`,
        [req.user.id]
      ),
      query(
        `SELECT COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE is_completed = TRUE)::int AS completed
         FROM adaptation_checklist_tasks
         WHERE user_id = $1`,
        [req.user.id]
      ),
    ]);

    const buddy = matchResult.rows[0] || null;
    const hasBuddy = Boolean(buddy);
    const profile = profileResult.rows[0] || {};
    const profileFields = [profile.full_name, profile.email, profile.home_country, profile.city, profile.study_program, (profile.languages || []).length ? 'yes' : '', (profile.hobbies || []).length ? 'yes' : '', profile.about_you, profile.gender, profile.gender_preference];
    const profileProgress = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);
    const checklistProgress = checklistResult.rows[0]?.total ? Math.round((checklistResult.rows[0].completed / checklistResult.rows[0].total) * 100) : 0;

    return res.json({
      progress: Math.max(profileProgress, checklistProgress),
      pendingRequests: requestResult.rows[0]?.count || 0,
      unreadMessages: unreadResult.rows[0]?.count || 0,
      buddy: hasBuddy
        ? {
            name: buddy.full_name,
            department: buddy.study_program || 'Not specified',
            avatar: buddy.profile_photo_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          }
        : null,
    });
  } catch (error) {
    console.error("Student dashboard error:", error.message);
    return res.status(500).json({ message: "Could not load dashboard." });
  }
});

router.get("/buddy", authenticate, async (req, res) => {
  try {
    const [matchesResult, pendingResult, unreadResult] = await Promise.all([
      query(
        `SELECT COUNT(*)::int AS count FROM buddy_matches WHERE buddy_id = $1 AND status = 'active'`,
        [req.user.id]
      ),
      query(
        `SELECT COUNT(*)::int AS count FROM buddy_requests WHERE buddy_id = $1 AND status = 'pending'`,
        [req.user.id]
      ),
      query(
        `SELECT COUNT(m.id)::int AS count
         FROM conversations c
         JOIN messages m ON m.conversation_id = c.id
         WHERE (c.international_student_id = $1 OR c.buddy_id = $1)
           AND m.sender_id <> $1 AND m.is_read = FALSE`,
        [req.user.id]
      ),
    ]);

    return res.json({
      activeStudents: matchesResult.rows[0]?.count || 0,
      pendingRequests: pendingResult.rows[0]?.count || 0,
      unreadMessages: unreadResult.rows[0]?.count || 0,
      maxStudents: 3,
    });
  } catch (error) {
    console.error("Buddy dashboard error:", error.message);
    return res.status(500).json({ message: "Could not load dashboard." });
  }
});

export default router;
