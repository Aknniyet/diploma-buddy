import { query } from "../config/db.js";

export function getNotificationsByUserId(userId) {
  return query(
    `SELECT id, type, title, description, reference_type, reference_id, is_read, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
}

export function markNotificationAsRead(notificationId, userId) {
  return query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE id = $1 AND user_id = $2
     RETURNING id, type, title, description, reference_type, reference_id, is_read, created_at`,
    [notificationId, userId]
  );
}

export function markAllNotificationsAsRead(userId) {
  return query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
}

export function deleteNotificationById(notificationId, userId) {
  return query(
    `DELETE FROM notifications
     WHERE id = $1 AND user_id = $2
     RETURNING id`,
    [notificationId, userId]
  );
}

export function createNotification({
  userId,
  type,
  title,
  description,
  referenceType = null,
  referenceId = null,
}) {
  return query(
    `INSERT INTO notifications (
      user_id, type, title, description, reference_type, reference_id, is_read
    )
    VALUES ($1, $2, $3, $4, $5, $6, FALSE)
    RETURNING *`,
    [userId, type, title, description, referenceType, referenceId]
  );
}

export function deleteNotificationsByReference(referenceType, referenceId) {
  return query(
    `DELETE FROM notifications
     WHERE reference_type = $1 AND reference_id = $2
     RETURNING id`,
    [referenceType, referenceId]
  );
}
