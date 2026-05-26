import { query } from "../config/db.js";

export function getAdminStats() {
  return Promise.all([
    query(`SELECT COUNT(*)::int AS count FROM users`),
    query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'international'`),
    query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'local'`),
    query(`SELECT COUNT(*)::int AS count FROM buddy_matches WHERE status = 'active'`),
    query(`SELECT COUNT(*)::int AS count FROM buddy_requests WHERE status = 'pending'`),
    query(`SELECT COUNT(*)::int AS count FROM events WHERE event_date >= NOW()`),
  ]);
}

export function getRecentUsers(limit = 5) {
  return query(
    `SELECT id, full_name, email, role, created_at AT TIME ZONE 'UTC' AS created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
}

export function getRecentBuddyRequests(limit = 5) {
  return query(
    `SELECT br.id, br.status, br.created_at AT TIME ZONE 'UTC' AS created_at,
            s.full_name AS student_name,
            b.full_name AS buddy_name
     FROM buddy_requests br
     JOIN users s ON s.id = br.international_student_id
     JOIN users b ON b.id = br.buddy_id
     ORDER BY br.created_at DESC
     LIMIT $1`,
    [limit]
  );
}

export function getUsersByRole() {
  return query(
    `SELECT role, COUNT(*)::int AS count
     FROM users
     GROUP BY role
     ORDER BY count DESC`
  );
}

export function getBuddyStatusDistribution() {
  return query(
    `SELECT buddy_status AS status, COUNT(*)::int AS count
     FROM users
     WHERE role = 'local'
     GROUP BY buddy_status
     ORDER BY count DESC`
  );
}

export function getCommunityPostsByCategory() {
  return query(
    `SELECT category, COUNT(*)::int AS count
     FROM community_posts
     WHERE status = 'active'
     GROUP BY category
     ORDER BY count DESC`
  );
}

export function getRegistrationsByWeek(limit = 6) {
  return query(
    `SELECT
       TO_CHAR(DATE_TRUNC('week', created_at), 'DD Mon') AS week_label,
       COUNT(*)::int AS count
     FROM users
     GROUP BY DATE_TRUNC('week', created_at)
     ORDER BY DATE_TRUNC('week', created_at) DESC
     LIMIT $1`,
    [limit]
  );
}

export function getStudentsWithoutBuddyCount() {
  return query(
    `SELECT COUNT(*)::int AS count
     FROM users u
     WHERE u.role = 'international'
       AND NOT EXISTS (
         SELECT 1
         FROM buddy_matches bm
         WHERE bm.international_student_id = u.id
           AND bm.status = 'active'
       )`
  );
}

export function getStudentAttentionSignals() {
  return query(
    `WITH checklist_stats AS (
       SELECT
         user_id,
         COUNT(*)::int AS total_tasks,
         COUNT(*) FILTER (WHERE is_completed = TRUE)::int AS completed_tasks
       FROM adaptation_checklist_tasks
       GROUP BY user_id
     ),
     active_matches AS (
       SELECT international_student_id AS user_id, COUNT(*)::int AS count
       FROM buddy_matches
       WHERE status = 'active'
       GROUP BY international_student_id
     ),
     pending_requests AS (
       SELECT international_student_id AS user_id, COUNT(*)::int AS count
       FROM buddy_requests
       WHERE status = 'pending'
       GROUP BY international_student_id
     ),
     sent_messages AS (
       SELECT c.international_student_id AS user_id, COUNT(m.id)::int AS count
       FROM conversations c
       JOIN messages m ON m.conversation_id = c.id
       WHERE m.sender_id = c.international_student_id
       GROUP BY c.international_student_id
     ),
     community_activity AS (
       SELECT source.user_id, COUNT(*)::int AS count
       FROM (
         SELECT author_id AS user_id FROM community_posts WHERE status = 'active'
         UNION ALL
         SELECT author_id AS user_id FROM community_comments
       ) AS source
       GROUP BY source.user_id
     )
     SELECT
       u.id,
       u.full_name,
       u.email,
       u.city,
       u.study_program,
       u.home_country,
       u.languages,
       u.hobbies,
       u.about_you,
       u.gender,
       u.profile_photo_url,
       u.created_at AT TIME ZONE 'UTC' AS created_at,
       CASE
         WHEN COALESCE(cs.total_tasks, 0) = 0 THEN 0
         ELSE ROUND((COALESCE(cs.completed_tasks, 0)::numeric / cs.total_tasks::numeric) * 100)
       END::int AS checklist_progress,
       COALESCE(am.count, 0) AS active_buddy_count,
       COALESCE(pr.count, 0) AS pending_request_count,
       COALESCE(sm.count, 0) AS sent_message_count,
       COALESCE(ca.count, 0) AS community_activity_count
     FROM users u
     LEFT JOIN checklist_stats cs ON cs.user_id = u.id
     LEFT JOIN active_matches am ON am.user_id = u.id
     LEFT JOIN pending_requests pr ON pr.user_id = u.id
     LEFT JOIN sent_messages sm ON sm.user_id = u.id
     LEFT JOIN community_activity ca ON ca.user_id = u.id
     WHERE u.role = 'international'
     ORDER BY u.created_at DESC`
  );
}
