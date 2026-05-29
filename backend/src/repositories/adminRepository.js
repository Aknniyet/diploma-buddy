import { query } from "../config/db.js";

export function getAdminStats() {
  return Promise.all([
    query(`SELECT COUNT(*)::int AS count FROM users`),
    query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'international'`),
    query(`SELECT COUNT(*)::int AS count FROM users WHERE role = 'local'`),
    query(`SELECT COUNT(*)::int AS count FROM buddy_matches WHERE status = 'active'`),
    query(`SELECT COUNT(*)::int AS count FROM buddy_requests WHERE status = 'pending'`),
    query(`SELECT COUNT(*)::int AS count FROM events WHERE event_date >= NOW()`),
    query(
      `SELECT COUNT(*)::int AS count
       FROM adaptation_checklist_tasks
       WHERE is_completed = FALSE
         AND deadline IS NOT NULL
         AND deadline < NOW()`
    ),
    query(
      `SELECT COUNT(*)::int AS count
       FROM adaptation_checklist_tasks
       WHERE is_completed = FALSE
         AND priority = 'high'`
    ),
  ]);
}

export function getRecentUsers(limit = 5) {
  return query(
    `SELECT id, full_name, email, role,
            created_at AT TIME ZONE 'UTC' AS created_at,
            last_active_at AT TIME ZONE 'UTC' AS last_active_at
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

export function getStudentAdaptationInsights() {
  return query(
    `SELECT u.id,
            u.full_name,
            u.email,
            u.created_at AT TIME ZONE 'UTC' AS created_at,
            u.last_active_at AT TIME ZONE 'UTC' AS last_active_at,
            COALESCE(task_stats.total_tasks, 0) AS total_tasks,
            COALESCE(task_stats.completed_tasks, 0) AS completed_tasks,
            COALESCE(task_stats.overdue_tasks, 0) AS overdue_tasks,
            COALESCE(task_stats.high_priority_incomplete, 0) AS high_priority_incomplete,
            COALESCE(request_stats.request_count, 0) AS request_count,
            COALESCE(request_stats.support_needs_count, 0) AS support_needs_count,
            latest_request.message AS latest_request_message,
            COALESCE(latest_request.support_topics, ARRAY[]::text[]) AS latest_support_topics,
            EXISTS (
              SELECT 1
              FROM buddy_matches bm
              WHERE bm.international_student_id = u.id
                AND bm.status = 'active'
            ) AS has_buddy_match
     FROM users u
     LEFT JOIN (
       SELECT user_id,
              COUNT(*)::int AS total_tasks,
              COUNT(*) FILTER (WHERE is_completed = TRUE)::int AS completed_tasks,
              COUNT(*) FILTER (
                WHERE is_completed = FALSE
                  AND deadline IS NOT NULL
                  AND deadline < NOW()
              )::int AS overdue_tasks,
              COUNT(*) FILTER (
                WHERE is_completed = FALSE
                  AND priority = 'high'
              )::int AS high_priority_incomplete
       FROM adaptation_checklist_tasks
       GROUP BY user_id
     ) task_stats ON task_stats.user_id = u.id
     LEFT JOIN (
       SELECT international_student_id AS user_id,
              COUNT(*)::int AS request_count,
              COALESCE(MAX(cardinality(COALESCE(support_topics, ARRAY[]::text[]))), 0)::int AS support_needs_count
       FROM buddy_requests
       GROUP BY international_student_id
     ) request_stats ON request_stats.user_id = u.id
     LEFT JOIN LATERAL (
       SELECT br.message, br.support_topics
       FROM buddy_requests br
       WHERE br.international_student_id = u.id
       ORDER BY br.created_at DESC
       LIMIT 1
     ) latest_request ON TRUE
     WHERE u.role = 'international'
     ORDER BY u.created_at DESC`
  );
}
