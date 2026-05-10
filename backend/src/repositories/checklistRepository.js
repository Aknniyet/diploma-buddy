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
    `INSERT INTO adaptation_checklist_tasks (
       user_id,
       category,
       title,
       description,
       priority,
       timeframe,
       action_label,
       action_url,
       is_completed
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)`,
    [
      userId,
      task.category,
      task.title,
      task.description,
      task.priority || "medium",
      task.timeframe || null,
      task.actionLabel || null,
      task.actionUrl || null,
    ]
  );
}

export async function updateChecklistTaskMetadata(userId, task) {
  return query(
    `UPDATE adaptation_checklist_tasks
     SET category = $3,
         description = $4,
         priority = $5,
         timeframe = $6,
         action_label = $7,
         action_url = $8,
         updated_at = NOW()
     WHERE user_id = $1 AND title = $2`,
    [
      userId,
      task.title,
      task.category,
      task.description,
      task.priority || "medium",
      task.timeframe || null,
      task.actionLabel || null,
      task.actionUrl || null,
    ]
  );
}

export async function getChecklistTasksByUserId(userId) {
  return query(
    `SELECT id, category, title, description, priority, timeframe, action_label, action_url, is_completed
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
     RETURNING id, category, title, description, priority, timeframe, action_label, action_url, is_completed`,
    [taskId, userId]
  );
}
