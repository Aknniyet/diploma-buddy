import { pool, query } from '../config/db.js';

export function findStudentForMatching(studentId) {
  return query(
    `SELECT id, role, study_program, languages, hobbies, gender_preference
     FROM users
     WHERE id = $1`,
    [studentId]
  );
}

export function findStudentActiveMatch(studentId) {
  return query(
    `SELECT id, buddy_id
     FROM buddy_matches
     WHERE international_student_id = $1 AND status = 'active'`,
    [studentId]
  );
}

export function findStudentRequestStatuses(studentId) {
  return query(
    `SELECT buddy_id, status
     FROM buddy_requests
     WHERE international_student_id = $1`,
    [studentId]
  );
}

export function findStudentPendingRequest(studentId) {
  return query(
    `SELECT id, buddy_id
     FROM buddy_requests
     WHERE international_student_id = $1 AND status = 'pending'
     ORDER BY created_at DESC
     LIMIT 1`,
    [studentId]
  );
}

export function findAvailableBuddies(
  activeMatchBuddyId = null,
  includeFullBuddies = false,
  viewerStudentId = null
) {
  return query(
    `SELECT u.id, u.full_name, u.email, u.city, u.study_program, u.languages, u.hobbies,
            u.about_you, u.gender, u.buddy_status, u.max_buddies, u.profile_photo_url,
            COUNT(m.id) FILTER (WHERE m.status = 'active') AS active_students_count,
            COALESCE((
              SELECT ROUND(AVG(bf.rating)::numeric, 1)::float
              FROM buddy_feedback bf
              WHERE bf.buddy_id = u.id
            ), 0) AS average_rating,
            (
              SELECT COUNT(*)::int
              FROM buddy_feedback bf
              WHERE bf.buddy_id = u.id
            ) AS feedback_count,
            (
              SELECT bf.rating
              FROM buddy_feedback bf
              WHERE bf.buddy_id = u.id AND bf.student_id = $3
              LIMIT 1
            ) AS current_user_rating,
            (
              SELECT bf.comment
              FROM buddy_feedback bf
              WHERE bf.buddy_id = u.id AND bf.student_id = $3
              LIMIT 1
            ) AS current_user_comment
     FROM users u
     LEFT JOIN buddy_matches m ON m.buddy_id = u.id AND m.status = 'active'
     WHERE u.role = 'local' AND u.buddy_status = 'approved'
     GROUP BY u.id
     HAVING $2 = TRUE
        OR COUNT(m.id) FILTER (WHERE m.status = 'active') < u.max_buddies
        OR u.id = $1
     ORDER BY u.full_name ASC`,
    [activeMatchBuddyId, includeFullBuddies, viewerStudentId]
  );
}

export function findBuddyCapacity(buddyId) {
  return query(
    `SELECT u.id,
            u.max_buddies,
            COUNT(m.id) FILTER (WHERE m.status = 'active') AS active_students_count
     FROM users u
     LEFT JOIN buddy_matches m ON m.buddy_id = u.id AND m.status = 'active'
     WHERE u.id = $1 AND u.role = 'local' AND u.buddy_status = 'approved'
     GROUP BY u.id`,
    [buddyId]
  );
}

export function findPendingRequestBetween(studentId, buddyId) {
  return query(
    `SELECT id
     FROM buddy_requests
     WHERE international_student_id = $1 AND buddy_id = $2 AND status = 'pending'`,
    [studentId, buddyId]
  );
}

export function createBuddyRequest(studentId, payload) {
  return query(
    `INSERT INTO buddy_requests (
        international_student_id,
        buddy_id,
        preferred_language,
        support_topics,
        message,
        status
     )
     VALUES ($1, $2, $3, $4::text[], $5, 'pending')
     RETURNING *`,
    [
      studentId,
      payload.buddyId,
      payload.preferredLanguage || null,
      payload.supportTopics || [],
      payload.message || null,
    ]
  );
}

export function findRequestsCreatedByStudent(studentId) {
  return query(
    `SELECT br.id, br.preferred_language, br.support_topics, br.message, br.status, br.created_at,
            br.responded_at, u.id AS buddy_id, u.full_name AS buddy_name
     FROM buddy_requests br
     JOIN users u ON u.id = br.buddy_id
     WHERE br.international_student_id = $1
     ORDER BY br.created_at DESC`,
    [studentId]
  );
}

export function findIncomingRequestsForBuddy(buddyId) {
  return query(
    `SELECT br.id, br.message, br.status, br.created_at, br.responded_at,
            s.id AS student_id, s.full_name, s.home_country, s.study_program, s.hobbies, s.profile_photo_url
     FROM buddy_requests br
     JOIN users s ON s.id = br.international_student_id
     WHERE br.buddy_id = $1
     ORDER BY CASE WHEN br.status = 'pending' THEN 0 ELSE 1 END, br.created_at DESC`,
    [buddyId]
  );
}

export async function respondToBuddyRequest({ requestId, buddyId, action }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const requestResult = await client.query(
      `SELECT * FROM buddy_requests WHERE id = $1 AND buddy_id = $2 FOR UPDATE`,
      [requestId, buddyId]
    );

    if (requestResult.rows.length === 0) {
      throw new Error('REQUEST_NOT_FOUND');
    }

    const buddyRequest = requestResult.rows[0];

    if (buddyRequest.status !== 'pending') {
      throw new Error('REQUEST_ALREADY_PROCESSED');
    }

    if (action === 'decline') {
      await client.query(
        `UPDATE buddy_requests SET status = 'declined', responded_at = NOW() WHERE id = $1`,
        [requestId]
      );
      await client.query('COMMIT');
      return {
        message: 'Request declined.',
        studentId: buddyRequest.international_student_id,
      };
    }

    const activeStudentsResult = await client.query(
      `SELECT COUNT(*)::int AS count FROM buddy_matches WHERE buddy_id = $1 AND status = 'active'`,
      [buddyId]
    );

    const buddyCapacityResult = await client.query(
      `SELECT max_buddies FROM users WHERE id = $1 AND role = 'local'`,
      [buddyId]
    );

    if (activeStudentsResult.rows[0].count >= Number(buddyCapacityResult.rows[0]?.max_buddies || 3)) {
      throw new Error('BUDDY_LIMIT_REACHED');
    }

    const studentActiveMatch = await client.query(
      `SELECT id FROM buddy_matches WHERE international_student_id = $1 AND status = 'active'`,
      [buddyRequest.international_student_id]
    );

    if (studentActiveMatch.rows.length > 0) {
      throw new Error('STUDENT_ALREADY_MATCHED');
    }

    await client.query(
      `UPDATE buddy_requests SET status = 'accepted', responded_at = NOW() WHERE id = $1`,
      [requestId]
    );

    await client.query(
      `INSERT INTO buddy_matches (international_student_id, buddy_id, status)
       VALUES ($1, $2, 'active')`,
      [buddyRequest.international_student_id, buddyId]
    );

    await client.query(
      `INSERT INTO conversations (international_student_id, buddy_id)
       VALUES ($1, $2)
       ON CONFLICT (international_student_id, buddy_id) DO NOTHING`,
      [buddyRequest.international_student_id, buddyId]
    );

    await client.query(
      `UPDATE buddy_requests
       SET status = 'cancelled', responded_at = NOW()
       WHERE international_student_id = $1 AND id <> $2 AND status = 'pending'`,
      [buddyRequest.international_student_id, requestId]
    );

    await client.query('COMMIT');
    return {
      message: 'Request accepted. Match created successfully.',
      studentId: buddyRequest.international_student_id,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export function findMyMatches(userId, role) {
  if (role === 'international') {
    return query(
      `SELECT bm.id, bm.status, bm.created_at,
              b.id AS buddy_id, b.full_name, b.email, b.city, b.study_program,
              b.languages, b.hobbies, b.about_you, b.profile_photo_url,
              COALESCE((
                SELECT ROUND(AVG(bf.rating)::numeric, 1)::float
                FROM buddy_feedback bf
                WHERE bf.buddy_id = b.id
              ), 0) AS average_rating,
              (
                SELECT COUNT(*)::int
                FROM buddy_feedback bf
                WHERE bf.buddy_id = b.id
              ) AS feedback_count,
              (
                SELECT bf.rating
                FROM buddy_feedback bf
                WHERE bf.buddy_id = b.id AND bf.student_id = $1
                LIMIT 1
              ) AS current_user_rating,
              (
                SELECT bf.comment
                FROM buddy_feedback bf
                WHERE bf.buddy_id = b.id AND bf.student_id = $1
                LIMIT 1
              ) AS current_user_comment
       FROM buddy_matches bm
       JOIN users b ON b.id = bm.buddy_id
       WHERE bm.international_student_id = $1 AND bm.status = 'active'`,
      [userId]
    );
  }

  if (role === 'local') {
    return query(
      `SELECT bm.id, bm.status, bm.created_at,
              s.id AS student_id, s.full_name, s.email, s.home_country, s.study_program,
              s.languages, s.hobbies, s.about_you, s.profile_photo_url,
              COALESCE((
                SELECT ROUND(AVG(bf.rating)::numeric, 1)::float
                FROM buddy_feedback bf
                WHERE bf.buddy_id = $1
              ), 0) AS average_rating,
              (
                SELECT COUNT(*)::int
                FROM buddy_feedback bf
                WHERE bf.buddy_id = $1
              ) AS feedback_count
       FROM buddy_matches bm
       JOIN users s ON s.id = bm.international_student_id
       WHERE bm.buddy_id = $1 AND bm.status = 'active'
       ORDER BY bm.created_at DESC`,
      [userId]
    );
  }

  return Promise.resolve({ rows: [] });
}

export function findStudentMatchedBuddy(studentId, buddyId) {
  return query(
    `SELECT id
     FROM buddy_matches
     WHERE international_student_id = $1 AND buddy_id = $2 AND status = 'active'
     LIMIT 1`,
    [studentId, buddyId]
  );
}

export function upsertBuddyFeedback(studentId, buddyId, rating, comment) {
  return query(
    `INSERT INTO buddy_feedback (buddy_id, student_id, rating, comment, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (buddy_id, student_id)
     DO UPDATE SET
       rating = EXCLUDED.rating,
       comment = EXCLUDED.comment,
       updated_at = NOW()
     RETURNING id, buddy_id, student_id, rating, comment, created_at, updated_at`,
    [buddyId, studentId, rating, comment]
  );
}

export function findBuddyFeedbackOverview(buddyId) {
  return query(
    `SELECT
       COALESCE((
         SELECT ROUND(AVG(rating)::numeric, 1)::float
         FROM buddy_feedback
         WHERE buddy_id = $1
       ), 0) AS average_rating,
       (
         SELECT COUNT(*)::int
         FROM buddy_feedback
         WHERE buddy_id = $1
       ) AS feedback_count,
       COALESCE((
         SELECT JSON_AGG(
           JSONB_BUILD_OBJECT(
             'id', recent.id,
             'rating', recent.rating,
             'comment', recent.comment,
             'created_at', recent.created_at,
             'student_id', recent.student_id,
             'student_name', recent.full_name,
             'student_photo_url', recent.profile_photo_url,
             'student_home_country', recent.home_country,
             'student_program', recent.study_program
           )
           ORDER BY recent.created_at DESC
         )
         FROM (
           SELECT bf.id, bf.rating, bf.comment, bf.created_at, bf.student_id,
                  u.full_name, u.profile_photo_url, u.home_country, u.study_program
           FROM buddy_feedback bf
           JOIN users u ON u.id = bf.student_id
           WHERE bf.buddy_id = $1
           ORDER BY bf.created_at DESC
           LIMIT 5
         ) AS recent
       ), '[]'::json) AS recent_reviews`,
    [buddyId]
  );
}
