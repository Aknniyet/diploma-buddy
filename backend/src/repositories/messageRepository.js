import { query } from '../config/db.js';

export function findConversationsForUser(userId) {
  return query(
    `SELECT c.id,
            CASE WHEN $1 = c.international_student_id THEN buddy.full_name ELSE student.full_name END AS partner_name,
            CASE WHEN $1 = c.international_student_id THEN buddy.role ELSE student.role END AS partner_role,
            CASE WHEN $1 = c.international_student_id THEN buddy.profile_photo_url ELSE student.profile_photo_url END AS partner_avatar,
            MAX(m.created_at) AS last_message_at,
            COALESCE((ARRAY_AGG(m.text ORDER BY m.created_at DESC))[1], '') AS last_message_text,
            COUNT(m.id) FILTER (WHERE m.sender_id <> $1 AND m.is_read = FALSE) AS unread_count
     FROM conversations c
     LEFT JOIN users student ON student.id = c.international_student_id
     LEFT JOIN users buddy ON buddy.id = c.buddy_id
     LEFT JOIN messages m ON m.conversation_id = c.id
     WHERE c.international_student_id = $1 OR c.buddy_id = $1
     GROUP BY c.id, buddy.full_name, buddy.role, buddy.profile_photo_url, student.full_name, student.role, student.profile_photo_url
     ORDER BY COALESCE(MAX(m.created_at), c.created_at) DESC`,
    [userId]
  );
}

export function findConversationForUser(conversationId, userId) {
  return query(
    `SELECT *
     FROM conversations
     WHERE id = $1 AND (international_student_id = $2 OR buddy_id = $2)`,
    [conversationId, userId]
  );
}

export function findMessagesInConversation(conversationId) {
  return query(
    `SELECT m.id, m.text, m.created_at, m.sender_id,
            u.full_name AS sender_name
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = $1
     ORDER BY m.created_at ASC`,
    [conversationId]
  );
}

export function markMessagesAsRead(conversationId, userId) {
  return query(
    `UPDATE messages
     SET is_read = TRUE
     WHERE conversation_id = $1 AND sender_id <> $2`,
    [conversationId, userId]
  );
}

export function createMessage(conversationId, senderId, text) {
  return query(
    `INSERT INTO messages (conversation_id, sender_id, text)
     VALUES ($1, $2, $3)
     RETURNING id, text, created_at`,
    [conversationId, senderId, text]
  );
}
