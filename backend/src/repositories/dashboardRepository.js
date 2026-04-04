import { query } from "../config/db.js";

export function findStudentDashboardData(userId) {
  return Promise.all([
    query(
      `SELECT b.full_name, b.study_program, b.profile_photo_url
       FROM buddy_matches bm
       JOIN users b ON b.id = bm.buddy_id
       WHERE bm.international_student_id = $1 AND bm.status = 'active'`,
      [userId]
    ),
    query(
      `SELECT COUNT(*)::int AS count
       FROM buddy_requests
       WHERE international_student_id = $1 AND status = 'pending'`,
      [userId]
    ),
    query(
      `SELECT COUNT(m.id)::int AS count
       FROM conversations c
       JOIN messages m ON m.conversation_id = c.id
       WHERE (c.international_student_id = $1 OR c.buddy_id = $1)
         AND m.sender_id <> $1 AND m.is_read = FALSE`,
      [userId]
    ),
  ]);
}

export function findBuddyDashboardData(userId) {
  return Promise.all([
    query(
      `SELECT COUNT(*)::int AS count
       FROM buddy_matches
       WHERE buddy_id = $1 AND status = 'active'`,
      [userId]
    ),
    query(
      `SELECT COUNT(*)::int AS count
       FROM buddy_requests
       WHERE buddy_id = $1 AND status = 'pending'`,
      [userId]
    ),
    query(
      `SELECT COUNT(m.id)::int AS count
       FROM conversations c
       JOIN messages m ON m.conversation_id = c.id
       WHERE (c.international_student_id = $1 OR c.buddy_id = $1)
         AND m.sender_id <> $1 AND m.is_read = FALSE`,
      [userId]
    ),
  ]);
}

export function findStudentChecklistTasks(userId) {
  return query(
    `SELECT id, category, title, description, is_completed
     FROM adaptation_checklist_tasks
     WHERE user_id = $1
     ORDER BY id ASC`,
    [userId]
  );
}