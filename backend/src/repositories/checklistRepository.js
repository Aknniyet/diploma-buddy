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
       deadline,
       action_label,
       action_url,
       is_completed,
       created_by,
       is_custom
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE, 'system', FALSE)`,
    [
      userId,
      task.category,
      task.title,
      task.description,
      task.priority || "medium",
      task.timeframe || null,
      task.deadline || null,
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
         deadline = $7,
         action_label = $8,
         action_url = $9,
         updated_at = NOW()
     WHERE user_id = $1 AND title = $2`,
    [
      userId,
      task.title,
      task.category,
      task.description,
      task.priority || "medium",
      task.timeframe || null,
      task.deadline || null,
      task.actionLabel || null,
      task.actionUrl || null,
    ]
  );
}

export async function getChecklistTasksByUserId(userId) {
  return query(
    `SELECT id, category, title, description, priority, timeframe, deadline,
            action_label, action_url, is_completed, created_by, is_custom, completed_at
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
         completed_at = CASE
           WHEN is_completed = FALSE THEN NOW()
           ELSE NULL
         END,
         updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING id, category, title, description, priority, timeframe, deadline,
               action_label, action_url, is_completed, created_by, is_custom, completed_at`,
    [taskId, userId]
  );
}

export async function createCustomChecklistTask(userId, task) {
  return query(
    `INSERT INTO adaptation_checklist_tasks (
       user_id,
       category,
       title,
       description,
       priority,
       timeframe,
       deadline,
       is_completed,
       created_by,
       is_custom
     )
     VALUES ($1, $2, $3, $4, $5, NULL, $6, FALSE, 'student', TRUE)
     RETURNING id, category, title, description, priority, timeframe, deadline,
               action_label, action_url, is_completed, created_by, is_custom, completed_at`,
    [
      userId,
      task.category,
      task.title,
      task.description,
      task.priority || "medium",
      task.deadline || null,
    ]
  );
}

export async function updateCustomChecklistTask(taskId, userId, task) {
  return query(
    `UPDATE adaptation_checklist_tasks
     SET category = $3,
         title = $4,
         description = $5,
         priority = $6,
         deadline = $7,
         updated_at = NOW()
     WHERE id = $1
       AND user_id = $2
       AND is_custom = TRUE
     RETURNING id, category, title, description, priority, timeframe, deadline,
               action_label, action_url, is_completed, created_by, is_custom, completed_at`,
    [
      taskId,
      userId,
      task.category,
      task.title,
      task.description,
      task.priority || "medium",
      task.deadline || null,
    ]
  );
}

export async function deleteCustomChecklistTask(taskId, userId) {
  return query(
    `DELETE FROM adaptation_checklist_tasks
     WHERE id = $1
       AND user_id = $2
       AND is_custom = TRUE
     RETURNING id`,
    [taskId, userId]
  );
}

export async function findChecklistTasksForReminders() {
  return query(
    `SELECT id, user_id, title, deadline
     FROM adaptation_checklist_tasks
     WHERE is_completed = FALSE
       AND deadline IS NOT NULL
       AND deadline <= NOW() + INTERVAL '24 hours'`
  );
}

export async function hasTaskReminderBeenSent(taskId, userId, reminderType) {
  return query(
    `SELECT id
     FROM task_reminder_deliveries
     WHERE task_id = $1
       AND user_id = $2
       AND reminder_type = $3
     LIMIT 1`,
    [taskId, userId, reminderType]
  );
}

export async function markTaskReminderSent(taskId, userId, reminderType) {
  return query(
    `INSERT INTO task_reminder_deliveries (task_id, user_id, reminder_type)
     VALUES ($1, $2, $3)
     ON CONFLICT (task_id, user_id, reminder_type) DO NOTHING
     RETURNING id`,
    [taskId, userId, reminderType]
  );
}
