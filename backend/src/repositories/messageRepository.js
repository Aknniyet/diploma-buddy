import { query } from '../config/db.js';

export function findConversationsForUser(userId) {
  return query(
    `WITH participant_conversations AS (
       SELECT c.id,
              c.created_at,
              CASE
                WHEN $1 = c.international_student_id THEN buddy.full_name
                ELSE student.full_name
              END AS partner_name,
              CASE
                WHEN $1 = c.international_student_id THEN buddy.role
                ELSE student.role
              END AS partner_role,
              CASE
                WHEN $1 = c.international_student_id THEN buddy.profile_photo_url
                ELSE student.profile_photo_url
              END AS partner_avatar
       FROM conversations c
       JOIN buddy_matches bm
         ON bm.international_student_id = c.international_student_id
        AND bm.buddy_id = c.buddy_id
        AND bm.status = 'active'
       LEFT JOIN users student ON student.id = c.international_student_id
       LEFT JOIN users buddy ON buddy.id = c.buddy_id
       WHERE c.international_student_id = $1 OR c.buddy_id = $1
     )
     SELECT pc.id,
            pc.partner_name,
            pc.partner_role,
            pc.partner_avatar,
            last_message.created_at AS last_message_at,
            last_message.sender_id AS last_message_sender_id,
            last_message.text AS last_message_legacy_text,
            last_message.encrypted_text AS last_message_encrypted_text,
            last_message.encryption_iv AS last_message_encryption_iv,
            last_message.encryption_auth_tag AS last_message_encryption_auth_tag,
            last_message.encryption_version AS last_message_encryption_version,
            COALESCE(unread.unread_count, 0) AS unread_count
     FROM participant_conversations pc
     LEFT JOIN LATERAL (
       SELECT m.sender_id,
              m.text,
              m.encrypted_text,
              m.encryption_iv,
              m.encryption_auth_tag,
              m.encryption_version,
              m.created_at AT TIME ZONE 'UTC' AS created_at
       FROM messages m
       LEFT JOIN conversation_clears cc
         ON cc.conversation_id = pc.id
        AND cc.user_id = $1
       LEFT JOIN message_deletions md
         ON md.message_id = m.id
        AND md.user_id = $1
       WHERE m.conversation_id = pc.id
         AND md.message_id IS NULL
         AND (cc.cleared_at IS NULL OR m.created_at > cc.cleared_at)
       ORDER BY m.created_at DESC
       LIMIT 1
     ) AS last_message ON TRUE
     LEFT JOIN LATERAL (
       SELECT COUNT(*)::int AS unread_count
       FROM messages m
       LEFT JOIN conversation_clears cc
         ON cc.conversation_id = pc.id
        AND cc.user_id = $1
       LEFT JOIN message_deletions md
         ON md.message_id = m.id
        AND md.user_id = $1
       WHERE m.conversation_id = pc.id
         AND m.sender_id <> $1
         AND m.is_read = FALSE
         AND md.message_id IS NULL
         AND (cc.cleared_at IS NULL OR m.created_at > cc.cleared_at)
     ) AS unread ON TRUE
     ORDER BY COALESCE(last_message.created_at, pc.created_at AT TIME ZONE 'UTC') DESC`,
    [userId]
  );
}

export function findConversationForUser(conversationId, userId) {
  return query(
    `SELECT c.*
     FROM conversations c
     JOIN buddy_matches bm
       ON bm.international_student_id = c.international_student_id
      AND bm.buddy_id = c.buddy_id
      AND bm.status = 'active'
     WHERE c.id = $1 AND (c.international_student_id = $2 OR c.buddy_id = $2)`,
    [conversationId, userId]
  );
}

export function findMessagesInConversation(conversationId, userId) {
  return query(
    `SELECT m.id,
            m.text,
            m.encrypted_text,
            m.encryption_iv,
            m.encryption_auth_tag,
            m.encryption_version,
            m.created_at AT TIME ZONE 'UTC' AS created_at,
            m.sender_id,
            u.full_name AS sender_name
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     LEFT JOIN conversation_clears cc
       ON cc.conversation_id = m.conversation_id
      AND cc.user_id = $2
     LEFT JOIN message_deletions md
       ON md.message_id = m.id
      AND md.user_id = $2
     WHERE m.conversation_id = $1
       AND md.message_id IS NULL
       AND (cc.cleared_at IS NULL OR m.created_at > cc.cleared_at)
     ORDER BY m.created_at ASC`,
    [conversationId, userId]
  );
}

export function markMessagesAsRead(conversationId, userId) {
  return query(
    `UPDATE messages
     SET is_read = TRUE
     WHERE id IN (
       SELECT m.id
       FROM messages m
       LEFT JOIN conversation_clears cc
         ON cc.conversation_id = m.conversation_id
        AND cc.user_id = $2
       LEFT JOIN message_deletions md
         ON md.message_id = m.id
        AND md.user_id = $2
       WHERE m.conversation_id = $1
         AND m.sender_id <> $2
         AND m.is_read = FALSE
         AND md.message_id IS NULL
         AND (cc.cleared_at IS NULL OR m.created_at > cc.cleared_at)
     )`,
    [conversationId, userId]
  );
}

export function createMessage(conversationId, senderId, encryptedMessage) {
  return query(
    `INSERT INTO messages (
       conversation_id,
       sender_id,
       text,
       encrypted_text,
       encryption_iv,
       encryption_auth_tag,
       encryption_version
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, created_at AT TIME ZONE 'UTC' AS created_at`,
    [
      conversationId,
      senderId,
      encryptedMessage.placeholderText,
      encryptedMessage.encryptedText,
      encryptedMessage.encryptionIv,
      encryptedMessage.encryptionAuthTag,
      encryptedMessage.encryptionVersion,
    ]
  );
}

export function countUnreadMessagesForUserInConversation(conversationId, userId) {
  return query(
    `SELECT COUNT(*)::int AS count
     FROM messages
     WHERE conversation_id = $1
       AND sender_id <> $2
       AND is_read = FALSE`,
    [conversationId, userId]
  );
}

export function deleteMessagesForUser(conversationId, userId, messageIds) {
  return query(
    `INSERT INTO message_deletions (message_id, user_id)
     SELECT m.id, $2
     FROM messages m
     LEFT JOIN conversation_clears cc
       ON cc.conversation_id = m.conversation_id
      AND cc.user_id = $2
     WHERE m.conversation_id = $1
       AND m.id = ANY($3::int[])
       AND (cc.cleared_at IS NULL OR m.created_at > cc.cleared_at)
     ON CONFLICT (message_id, user_id) DO NOTHING
     RETURNING message_id`,
    [conversationId, userId, messageIds]
  );
}

export function clearConversationForUser(conversationId, userId) {
  return query(
    `INSERT INTO conversation_clears (conversation_id, user_id, cleared_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (conversation_id, user_id)
     DO UPDATE SET cleared_at = EXCLUDED.cleared_at
     RETURNING cleared_at AT TIME ZONE 'UTC' AS cleared_at`,
    [conversationId, userId]
  );
}
