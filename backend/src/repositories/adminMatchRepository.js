import { pool, query } from "../config/db.js";

export async function ensureAdminNotesTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS admin_match_notes (
      id SERIAL PRIMARY KEY,
      match_id INTEGER REFERENCES buddy_matches(id) ON DELETE CASCADE,
      request_id INTEGER REFERENCES buddy_requests(id) ON DELETE CASCADE,
      note TEXT NOT NULL,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`
  );
}

export function getBuddyProfiles() {
  return query(
    `SELECT u.id, u.full_name, u.email, u.city, u.study_program, u.languages, u.hobbies,
            u.about_you, u.buddy_status, u.max_buddies, u.created_at,
            COUNT(m.id) FILTER (WHERE m.status = 'active')::int AS active_students_count
     FROM users u
     LEFT JOIN buddy_matches m ON m.buddy_id = u.id AND m.status = 'active'
     WHERE u.role = 'local'
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );
}

export function getPendingRequestsForAdmin() {
  return query(
    `SELECT br.id, br.created_at, br.message, br.preferred_language, br.status,
            s.id AS student_id, s.full_name AS student_name, s.study_program AS student_program,
            s.languages AS student_languages, s.hobbies AS student_hobbies, s.gender_preference,
            b.id AS buddy_id, b.full_name AS buddy_name, b.study_program AS buddy_program,
            b.languages AS buddy_languages, b.hobbies AS buddy_hobbies, b.gender,
            b.max_buddies,
            COUNT(m.id) FILTER (WHERE m.status = 'active') AS active_students_count
     FROM buddy_requests br
     JOIN users s ON s.id = br.international_student_id
     JOIN users b ON b.id = br.buddy_id
     LEFT JOIN buddy_matches m ON m.buddy_id = b.id AND m.status = 'active'
     WHERE br.status = 'pending'
     GROUP BY br.id, s.id, b.id
     ORDER BY br.created_at DESC`
  );
}

export function getActiveMatchesForAdmin() {
  return query(
    `SELECT bm.id, bm.status, bm.created_at,
            s.id AS student_id, s.full_name AS student_name,
            b.id AS buddy_id, b.full_name AS buddy_name,
            COALESCE(notes.note_count, 0) AS note_count
     FROM buddy_matches bm
     JOIN users s ON s.id = bm.international_student_id
     JOIN users b ON b.id = bm.buddy_id
     LEFT JOIN (
       SELECT match_id, COUNT(*)::int AS note_count
       FROM admin_match_notes
       WHERE match_id IS NOT NULL
       GROUP BY match_id
     ) notes ON notes.match_id = bm.id
     WHERE bm.status = 'active'
     ORDER BY bm.created_at DESC`
  );
}

export function getUnmatchedStudents() {
  return query(
    `SELECT u.id, u.full_name, u.home_country, u.city, u.study_program, u.languages, u.hobbies,
            u.gender_preference, u.created_at,
            CASE
              WHEN EXISTS (
                SELECT 1 FROM buddy_requests br
                WHERE br.international_student_id = u.id AND br.status = 'pending'
              )
              THEN 'request_pending'
              ELSE 'waiting_for_match'
            END AS match_status
     FROM users u
     WHERE u.role = 'international'
       AND NOT EXISTS (
         SELECT 1
         FROM buddy_matches bm
         WHERE bm.international_student_id = u.id AND bm.status = 'active'
       )
     ORDER BY u.created_at DESC`
  );
}

export function getApprovedBuddiesForAdmin() {
  return query(
    `SELECT u.id, u.full_name, u.email, u.city, u.study_program, u.languages, u.hobbies,
            u.about_you, u.gender, u.buddy_status, u.max_buddies, u.profile_photo_url,
            COUNT(m.id) FILTER (WHERE m.status = 'active') AS active_students_count
     FROM users u
     LEFT JOIN buddy_matches m ON m.buddy_id = u.id AND m.status = 'active'
     WHERE u.role = 'local' AND u.buddy_status = 'approved'
     GROUP BY u.id
     ORDER BY u.full_name ASC`
  );
}

export async function adminApproveRequest({ requestId, adminId }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const requestResult = await client.query(
      `SELECT *
       FROM buddy_requests
       WHERE id = $1
       FOR UPDATE`,
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      throw new Error("REQUEST_NOT_FOUND");
    }

    const buddyRequest = requestResult.rows[0];

    if (buddyRequest.status !== "pending") {
      throw new Error("REQUEST_ALREADY_PROCESSED");
    }

    const activeStudentsResult = await client.query(
      `SELECT u.max_buddies,
              COUNT(m.id) FILTER (WHERE m.status = 'active')::int AS count
       FROM users u
       LEFT JOIN buddy_matches m ON m.buddy_id = u.id AND m.status = 'active'
       WHERE u.id = $1
       GROUP BY u.id`,
      [buddyRequest.buddy_id]
    );

    if (activeStudentsResult.rows[0].count >= Number(activeStudentsResult.rows[0].max_buddies || 3)) {
      throw new Error("BUDDY_LIMIT_REACHED");
    }

    const studentActiveMatch = await client.query(
      `SELECT id
       FROM buddy_matches
       WHERE international_student_id = $1 AND status = 'active'`,
      [buddyRequest.international_student_id]
    );

    if (studentActiveMatch.rows.length > 0) {
      throw new Error("STUDENT_ALREADY_MATCHED");
    }

    const updatedRequest = await client.query(
      `UPDATE buddy_requests
       SET status = 'accepted', responded_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [requestId]
    );

    const matchResult = await client.query(
      `INSERT INTO buddy_matches (international_student_id, buddy_id, status)
       VALUES ($1, $2, 'active')
       RETURNING id, international_student_id, buddy_id, status, created_at`,
      [buddyRequest.international_student_id, buddyRequest.buddy_id]
    );

    await client.query(
      `INSERT INTO conversations (international_student_id, buddy_id)
       VALUES ($1, $2)
       ON CONFLICT (international_student_id, buddy_id) DO NOTHING`,
      [buddyRequest.international_student_id, buddyRequest.buddy_id]
    );

    await client.query(
      `UPDATE buddy_requests
       SET status = 'cancelled', responded_at = NOW()
       WHERE international_student_id = $1 AND id <> $2 AND status = 'pending'`,
      [buddyRequest.international_student_id, requestId]
    );

    await client.query("COMMIT");

    return {
      request: updatedRequest.rows[0],
      match: matchResult.rows[0],
      adminId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateMatchStatus(matchId, status) {
  return query(
    `UPDATE buddy_matches bm
     SET status = $2
     FROM users s, users b
     WHERE bm.id = $1
       AND s.id = bm.international_student_id
       AND b.id = bm.buddy_id
     RETURNING bm.id, bm.international_student_id, bm.buddy_id, bm.status, bm.created_at,
               s.full_name AS student_name, b.full_name AS buddy_name`,
    [matchId, status]
  );
}

export function getMatchHistoryForAdmin() {
  return query(
    `SELECT bm.id, bm.status, bm.created_at,
            s.id AS student_id, s.full_name AS student_name,
            b.id AS buddy_id, b.full_name AS buddy_name,
            COALESCE(notes.note_count, 0) AS note_count
     FROM buddy_matches bm
     JOIN users s ON s.id = bm.international_student_id
     JOIN users b ON b.id = bm.buddy_id
     LEFT JOIN (
       SELECT match_id, COUNT(*)::int AS note_count
       FROM admin_match_notes
       WHERE match_id IS NOT NULL
       GROUP BY match_id
     ) notes ON notes.match_id = bm.id
     WHERE bm.status IN ('completed', 'cancelled')
     ORDER BY bm.created_at DESC
     LIMIT 30`
  );
}

export function getBuddyActiveMatchCount(buddyId) {
  return query(
    `SELECT COUNT(*)::int AS count
     FROM buddy_matches
     WHERE buddy_id = $1 AND status = 'active'`,
    [buddyId]
  );
}

export async function createManualMatch({ studentId, buddyId }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const peopleResult = await client.query(
      `SELECT
         s.id AS student_id, s.full_name AS student_name, s.role AS student_role,
         b.id AS buddy_id, b.full_name AS buddy_name, b.role AS buddy_role, b.buddy_status, b.max_buddies,
         COUNT(m.id) FILTER (WHERE m.status = 'active')::int AS active_students_count
       FROM users s
       CROSS JOIN users b
       LEFT JOIN buddy_matches m ON m.buddy_id = b.id AND m.status = 'active'
       WHERE s.id = $1 AND b.id = $2
       GROUP BY s.id, b.id`,
      [studentId, buddyId]
    );

    if (peopleResult.rows.length === 0) {
      throw new Error("PAIR_NOT_FOUND");
    }

    const pair = peopleResult.rows[0];

    if (pair.student_role !== "international") {
      throw new Error("INVALID_STUDENT");
    }

    if (pair.buddy_role !== "local" || pair.buddy_status !== "approved") {
      throw new Error("BUDDY_NOT_FOUND");
    }

    if (pair.active_students_count >= Number(pair.max_buddies || 3)) {
      throw new Error("BUDDY_LIMIT_REACHED");
    }

    const studentActiveMatch = await client.query(
      `SELECT id
       FROM buddy_matches
       WHERE international_student_id = $1 AND status = 'active'`,
      [studentId]
    );

    if (studentActiveMatch.rows.length > 0) {
      throw new Error("STUDENT_ALREADY_MATCHED");
    }

    const matchResult = await client.query(
      `INSERT INTO buddy_matches (international_student_id, buddy_id, status)
       VALUES ($1, $2, 'active')
       RETURNING id, international_student_id, buddy_id, status, created_at`,
      [studentId, buddyId]
    );

    await client.query(
      `INSERT INTO conversations (international_student_id, buddy_id)
       VALUES ($1, $2)
       ON CONFLICT (international_student_id, buddy_id) DO NOTHING`,
      [studentId, buddyId]
    );

    await client.query(
      `UPDATE buddy_requests
       SET status = 'cancelled', responded_at = NOW()
       WHERE international_student_id = $1 AND status = 'pending'`,
      [studentId]
    );

    await client.query("COMMIT");

    return {
      ...matchResult.rows[0],
      student_name: pair.student_name,
      buddy_name: pair.buddy_name,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function reassignMatch(matchId, newBuddyId) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const matchResult = await client.query(
      `SELECT *
       FROM buddy_matches
       WHERE id = $1
       FOR UPDATE`,
      [matchId]
    );

    if (matchResult.rows.length === 0) {
      throw new Error("MATCH_NOT_FOUND");
    }

    const match = matchResult.rows[0];

    if (Number(match.buddy_id) === Number(newBuddyId)) {
      throw new Error("SAME_BUDDY");
    }

    const newBuddyResult = await client.query(
      `SELECT u.id, u.full_name,
              u.max_buddies,
              COUNT(m.id) FILTER (WHERE m.status = 'active')::int AS active_students_count
       FROM users u
       LEFT JOIN buddy_matches m ON m.buddy_id = u.id AND m.status = 'active'
       WHERE u.id = $1 AND u.role = 'local' AND u.buddy_status = 'approved'
       GROUP BY u.id`,
      [newBuddyId]
    );

    if (newBuddyResult.rows.length === 0) {
      throw new Error("BUDDY_NOT_FOUND");
    }

    if (newBuddyResult.rows[0].active_students_count >= Number(newBuddyResult.rows[0].max_buddies || 3)) {
      throw new Error("BUDDY_LIMIT_REACHED");
    }

    const matchPeopleResult = await client.query(
      `SELECT s.full_name AS student_name,
              old_buddy.full_name AS old_buddy_name
       FROM buddy_matches bm
       JOIN users s ON s.id = bm.international_student_id
       JOIN users old_buddy ON old_buddy.id = bm.buddy_id
       WHERE bm.id = $1`,
      [matchId]
    );

    const otherActiveMatch = await client.query(
      `SELECT id
       FROM buddy_matches
       WHERE international_student_id = $1
         AND status = 'active'
         AND id <> $2`,
      [match.international_student_id, matchId]
    );

    if (otherActiveMatch.rows.length > 0) {
      throw new Error("STUDENT_ALREADY_MATCHED");
    }

    const updatedMatch = await client.query(
      `UPDATE buddy_matches
       SET buddy_id = $2, status = 'active'
       WHERE id = $1
       RETURNING id, international_student_id, buddy_id, status, created_at`,
      [matchId, newBuddyId]
    );

    await client.query(
      `INSERT INTO conversations (international_student_id, buddy_id)
       VALUES ($1, $2)
       ON CONFLICT (international_student_id, buddy_id) DO NOTHING`,
      [match.international_student_id, newBuddyId]
    );

    await client.query("COMMIT");
    return {
      ...updatedMatch.rows[0],
      old_buddy_id: match.buddy_id,
      old_buddy_name: matchPeopleResult.rows[0]?.old_buddy_name || "Previous buddy",
      new_buddy_name: newBuddyResult.rows[0].full_name,
      student_name: matchPeopleResult.rows[0]?.student_name || "Student",
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createAdminMatchNote({ matchId = null, requestId = null, note, createdBy }) {
  await ensureAdminNotesTable();

  return query(
    `INSERT INTO admin_match_notes (match_id, request_id, note, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, match_id, request_id, note, created_by, created_at`,
    [matchId, requestId, note, createdBy]
  );
}

export async function getAdminNotesForMatch(matchId) {
  await ensureAdminNotesTable();

  return query(
    `SELECT id, note, created_by, created_at
     FROM admin_match_notes
     WHERE match_id = $1
     ORDER BY created_at DESC`,
    [matchId]
  );
}
