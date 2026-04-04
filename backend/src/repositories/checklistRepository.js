import { query } from "../config/db.js";

export async function countUserChecklistTasks(userId) {
  return query(
    `SELECT COUNT(*)::int AS count
     FROM adaptation_checklist_tasks
     WHERE user_id = $1`,
    [userId]
  );
}

export async function insertChecklistTask(userId, task) {
  return query(
    `INSERT INTO adaptation_checklist_tasks (user_id, category, title, description, is_completed)
     VALUES ($1, $2, $3, $4, FALSE)`,
    [userId, task.category, task.title, task.description]
  );
}

export async function getChecklistTasksByUserId(userId) {
  return query(
    `SELECT id, category, title, description, is_completed
     FROM adaptation_checklist_tasks
     WHERE user_id = $1
     ORDER BY id ASC`,
    [userId]
  );
}

export async function toggleChecklistTask(taskId, userId) {
  return query(
    `UPDATE adaptation_checklist_tasks
     SET is_completed = NOT is_completed,
         updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING id, category, title, description, is_completed`,
    [taskId, userId]
  );
}