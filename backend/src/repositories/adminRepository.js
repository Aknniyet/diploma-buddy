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
    `SELECT id, full_name, email, role, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  );
}

export function getRecentBuddyRequests(limit = 5) {
  return query(
    `SELECT br.id, br.status, br.created_at,
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
