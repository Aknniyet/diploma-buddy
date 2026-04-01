import express from "express";
import { query, pool } from "../config/db.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

async function createNotification(userId, type, title, description, referenceType = null, referenceId = null) {
  await query(
    `INSERT INTO notifications (user_id, type, title, description, reference_type, reference_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, type, title, description, referenceType, referenceId]
  );
}

function calculateScore(student, buddy) {
  let score = 0;

  const studentLanguages = student.languages || [];
  const buddyLanguages = buddy.languages || [];
  const studentHobbies = student.hobbies || [];
  const buddyHobbies = buddy.hobbies || [];

  if (student.study_program && buddy.study_program && student.study_program === buddy.study_program) {
    score += 3;
  }

  const sharedLanguages = studentLanguages.filter((item) => buddyLanguages.includes(item));
  score += Math.min(sharedLanguages.length, 2) * 3;

  const sharedHobbies = studentHobbies.filter((item) => buddyHobbies.includes(item));
  score += Math.min(sharedHobbies.length, 2) * 2;

  if (
    student.gender_preference &&
    student.gender_preference !== "no_preference" &&
    buddy.gender &&
    student.gender_preference === buddy.gender
  ) {
    score += 2;
  }

  return score;
}

router.get("/available", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "international") {
      return res.status(403).json({ message: "Only international students can browse buddies." });
    }

    const studentResult = await query(
      `SELECT id, role, study_program, languages, hobbies, gender_preference
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    const student = studentResult.rows[0];

    const studentActiveMatch = await query(
      `SELECT buddy_id FROM buddy_matches
       WHERE international_student_id = $1 AND status = 'active'`,
      [req.user.id]
    );

    const activeMatchBuddyId = studentActiveMatch.rows[0]?.buddy_id || null;

    const requestStatuses = await query(
      `SELECT buddy_id, status FROM buddy_requests WHERE international_student_id = $1`,
      [req.user.id]
    );
    const statusMap = new Map(requestStatuses.rows.map((item) => [item.buddy_id, item.status]));

    const result = await query(
      `SELECT u.id, u.full_name, u.email, u.city, u.study_program, u.languages, u.hobbies,
              u.about_you, u.gender, u.buddy_status, u.profile_photo_url,
              COUNT(m.id) FILTER (WHERE m.status = 'active') AS active_students_count
       FROM users u
       LEFT JOIN buddy_matches m ON m.buddy_id = u.id AND m.status = 'active'
       WHERE u.role = 'local' AND u.buddy_status = 'approved'
       GROUP BY u.id
       HAVING COUNT(m.id) FILTER (WHERE m.status = 'active') < 3
       ORDER BY u.full_name ASC`
    );

    const formatted = result.rows.map((buddy) => {
      const score = calculateScore(student, buddy);
      const activeStudents = Number(buddy.active_students_count || 0);
      const pendingOrAcceptedStatus = statusMap.get(buddy.id) || null;
      const isMatched = activeMatchBuddyId === buddy.id;

      return {
        id: buddy.id,
        name: buddy.full_name,
        email: buddy.email,
        city: buddy.city || "Kazakhstan",
        program: buddy.study_program || "Not specified",
        languages: (buddy.languages || []).join(", "),
        bio: buddy.about_you || "This buddy has not added a bio yet.",
        interests: buddy.hobbies || [],
        spotsAvailable: Math.max(0, 3 - activeStudents),
        activeStudents,
        score,
        status: isMatched ? "matched" : pendingOrAcceptedStatus,
        avatar: buddy.profile_photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      };
    });

    formatted.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

    return res.json(formatted);
  } catch (error) {
    console.error("Available buddies error:", error.message);
    return res.status(500).json({ message: "Could not load buddies." });
  }
});

router.post("/requests", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "international") {
      return res.status(403).json({ message: "Only international students can create buddy requests." });
    }

    const { buddyId, preferredLanguage, supportTopics, message } = req.body;

    if (!buddyId) {
      return res.status(400).json({ message: "Buddy id is required." });
    }

    const activeMatch = await query(
      `SELECT id FROM buddy_matches WHERE international_student_id = $1 AND status = 'active'`,
      [req.user.id]
    );

    if (activeMatch.rows.length > 0) {
      return res.status(400).json({ message: "You already have an active buddy." });
    }

    const buddyResult = await query(
      `SELECT u.id,
              COUNT(m.id) FILTER (WHERE m.status = 'active') AS active_students_count
       FROM users u
       LEFT JOIN buddy_matches m ON m.buddy_id = u.id AND m.status = 'active'
       WHERE u.id = $1 AND u.role = 'local' AND u.buddy_status = 'approved'
       GROUP BY u.id`,
      [buddyId]
    );

    if (buddyResult.rows.length === 0) {
      return res.status(404).json({ message: "Selected buddy is not available." });
    }

    if (Number(buddyResult.rows[0].active_students_count || 0) >= 3) {
      return res.status(400).json({ message: "This buddy already has the maximum number of students." });
    }

    const existingPending = await query(
      `SELECT id FROM buddy_requests WHERE international_student_id = $1 AND buddy_id = $2 AND status = 'pending'`,
      [req.user.id, buddyId]
    );

    if (existingPending.rows.length > 0) {
      return res.status(409).json({ message: "You already sent a request to this buddy." });
    }

    const result = await query(
      `INSERT INTO buddy_requests (international_student_id, buddy_id, preferred_language, support_topics, message, status)
       VALUES ($1, $2, $3, $4::text[], $5, 'pending')
       RETURNING *`,
      [req.user.id, buddyId, preferredLanguage || null, supportTopics || [], message || null]
    );

    await createNotification(
      buddyId,
      'request_received',
      'New buddy request',
      'An international student sent you a new buddy request.',
      'buddy_request',
      result.rows[0].id
    ).catch(() => null);

    await createNotification(
      req.user.id,
      'request_sent',
      'Request sent',
      'Your buddy request was sent successfully. Please wait for a response.',
      'buddy_request',
      result.rows[0].id
    ).catch(() => null);

    return res.status(201).json({
      message: "Your request has been sent. Please wait for the buddy’s response.",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Create buddy request error:", error.message);
    return res.status(500).json({ message: "Could not create buddy request." });
  }
});

router.get("/requests/my", authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT br.id, br.preferred_language, br.support_topics, br.message, br.status, br.created_at,
              br.responded_at, u.id AS buddy_id, u.full_name AS buddy_name
       FROM buddy_requests br
       JOIN users u ON u.id = br.buddy_id
       WHERE br.international_student_id = $1
       ORDER BY br.created_at DESC`,
      [req.user.id]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("My buddy requests error:", error.message);
    return res.status(500).json({ message: "Could not load your requests." });
  }
});

router.get("/requests/incoming", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "local") {
      return res.status(403).json({ message: "Only buddies can view incoming requests." });
    }

    const result = await query(
      `SELECT br.id, br.message, br.status, br.created_at, br.responded_at,
              s.id AS student_id, s.full_name, s.home_country, s.study_program, s.hobbies, s.profile_photo_url
       FROM buddy_requests br
       JOIN users s ON s.id = br.international_student_id
       WHERE br.buddy_id = $1
       ORDER BY CASE WHEN br.status = 'pending' THEN 0 ELSE 1 END, br.created_at DESC`,
      [req.user.id]
    );

    const formatted = result.rows.map((item) => ({
      id: item.id,
      name: item.full_name,
      country: item.home_country || "Not specified",
      program: item.study_program || "Not specified",
      interests: item.hobbies || [],
      message: item.message || "No message provided.",
      date: new Date(item.created_at).toLocaleDateString(),
      avatar: item.profile_photo_url || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      status: item.status,
    }));

    return res.json({
      pending: formatted.filter((item) => item.status === 'pending'),
      past: formatted.filter((item) => item.status !== 'pending'),
    });
  } catch (error) {
    console.error("Incoming buddy requests error:", error.message);
    return res.status(500).json({ message: "Could not load buddy requests." });
  }
});

router.patch("/requests/:requestId/respond", authenticate, async (req, res) => {
  const client = await pool.connect();

  try {
    if (req.user.role !== "local") {
      return res.status(403).json({ message: "Only buddies can respond to requests." });
    }

    const { requestId } = req.params;
    const { action } = req.body;

    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ message: "Action must be accept or decline." });
    }

    await client.query("BEGIN");

    const requestResult = await client.query(
      `SELECT * FROM buddy_requests WHERE id = $1 AND buddy_id = $2 FOR UPDATE`,
      [requestId, req.user.id]
    );

    if (requestResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Request not found." });
    }

    const buddyRequest = requestResult.rows[0];

    if (buddyRequest.status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "This request has already been processed." });
    }

    if (action === "decline") {
      await client.query(
        `UPDATE buddy_requests SET status = 'declined', responded_at = NOW() WHERE id = $1`,
        [requestId]
      );
      await client.query("COMMIT");
      await createNotification(
        buddyRequest.international_student_id,
        'request_declined',
        'Buddy request declined',
        'Your buddy request was declined. You can browse and send another request.',
        'buddy_request',
        Number(requestId)
      ).catch(() => null);
      return res.json({ message: "Request declined." });
    }

    const activeStudentsResult = await client.query(
      `SELECT COUNT(*)::int AS count FROM buddy_matches WHERE buddy_id = $1 AND status = 'active'`,
      [req.user.id]
    );

    if (activeStudentsResult.rows[0].count >= 3) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "You already have 3 active students." });
    }

    const studentActiveMatch = await client.query(
      `SELECT id FROM buddy_matches WHERE international_student_id = $1 AND status = 'active'`,
      [buddyRequest.international_student_id]
    );

    if (studentActiveMatch.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "This student already has an active buddy." });
    }

    await client.query(
      `UPDATE buddy_requests SET status = 'accepted', responded_at = NOW() WHERE id = $1`,
      [requestId]
    );

    await client.query(
      `INSERT INTO buddy_matches (international_student_id, buddy_id, status)
       VALUES ($1, $2, 'active')`,
      [buddyRequest.international_student_id, req.user.id]
    );

    await client.query(
      `INSERT INTO conversations (international_student_id, buddy_id)
       VALUES ($1, $2)
       ON CONFLICT (international_student_id, buddy_id) DO NOTHING`,
      [buddyRequest.international_student_id, req.user.id]
    );

    await client.query(
      `UPDATE buddy_requests
       SET status = 'cancelled', responded_at = NOW()
       WHERE international_student_id = $1 AND id <> $2 AND status = 'pending'`,
      [buddyRequest.international_student_id, requestId]
    );

    await client.query("COMMIT");

    await createNotification(
      buddyRequest.international_student_id,
      'request_accepted',
      'Buddy request accepted',
      'Your request was accepted. You can now start messaging your buddy.',
      'buddy_match',
      buddyRequest.id
    ).catch(() => null);

    await createNotification(
      req.user.id,
      'match_created',
      'Student matched',
      'You accepted a request and a new chat is now available.',
      'buddy_match',
      buddyRequest.id
    ).catch(() => null);

    return res.json({ message: "Request accepted. Match created successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Respond to request error:", error.message);
    return res.status(500).json({ message: "Could not process the request." });
  } finally {
    client.release();
  }
});

router.get("/matches/my", authenticate, async (req, res) => {
  try {
    if (req.user.role === 'international') {
      const result = await query(
        `SELECT bm.id, bm.status, bm.created_at,
                b.id AS buddy_id, b.full_name, b.email, b.city, b.study_program,
                b.languages, b.hobbies, b.about_you, b.profile_photo_url
         FROM buddy_matches bm
         JOIN users b ON b.id = bm.buddy_id
         WHERE bm.international_student_id = $1 AND bm.status = 'active'`,
        [req.user.id]
      );

      return res.json(result.rows[0] || null);
    }

    if (req.user.role === 'local') {
      const result = await query(
        `SELECT bm.id, bm.status, bm.created_at,
                s.id AS student_id, s.full_name, s.email, s.home_country, s.study_program,
                s.languages, s.hobbies, s.about_you, s.profile_photo_url
         FROM buddy_matches bm
         JOIN users s ON s.id = bm.international_student_id
         WHERE bm.buddy_id = $1 AND bm.status = 'active'
         ORDER BY bm.created_at DESC`,
        [req.user.id]
      );

      return res.json(result.rows);
    }

    return res.json([]);
  } catch (error) {
    console.error("Get matches error:", error.message);
    return res.status(500).json({ message: "Could not load matches." });
  }
});

export default router;
