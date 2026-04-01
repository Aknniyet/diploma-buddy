import express from "express";
import { query } from "../config/db.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

async function createNotification(userId, type, title, description, referenceType = null, referenceId = null) {
  await query(
    `INSERT INTO notifications (user_id, type, title, description, reference_type, reference_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, type, title, description, referenceType, referenceId]
  );
}

router.get("/conversations", authenticate, async (req, res) => {
  try {
    const result = await query(
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
      [req.user.id]
    );

    const formatted = result.rows.map((item) => ({
      id: item.id,
      name: item.partner_name,
      role: item.partner_role === 'local' ? 'Buddy' : 'International Student',
      avatar: item.partner_avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      preview: item.last_message_text || 'No messages yet',
      unreadCount: Number(item.unread_count || 0),
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("Conversations error:", error.message);
    return res.status(500).json({ message: "Could not load conversations." });
  }
});

router.get("/conversations/:conversationId/messages", authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversationCheck = await query(
      `SELECT * FROM conversations WHERE id = $1 AND (international_student_id = $2 OR buddy_id = $2)`,
      [conversationId, req.user.id]
    );

    if (conversationCheck.rows.length === 0) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const result = await query(
      `SELECT m.id, m.text, m.created_at, m.sender_id,
              u.full_name AS sender_name
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

    await query(
      `UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND sender_id <> $2`,
      [conversationId, req.user.id]
    );

    return res.json(result.rows.map((item) => ({
      id: item.id,
      text: item.text,
      sender: item.sender_id === req.user.id ? 'me' : 'other',
      senderName: item.sender_name,
      createdAt: item.created_at,
    })));
  } catch (error) {
    console.error("Messages error:", error.message);
    return res.status(500).json({ message: "Could not load messages." });
  }
});

router.post("/conversations/:conversationId/messages", authenticate, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required." });
    }

    const conversationCheck = await query(
      `SELECT * FROM conversations WHERE id = $1 AND (international_student_id = $2 OR buddy_id = $2)`,
      [conversationId, req.user.id]
    );

    if (conversationCheck.rows.length === 0) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const result = await query(
      `INSERT INTO messages (conversation_id, sender_id, text)
       VALUES ($1, $2, $3)
       RETURNING id, text, created_at`,
      [conversationId, req.user.id, text.trim()]
    );

    const conversation = conversationCheck.rows[0];
    const receiverId = conversation.international_student_id === req.user.id ? conversation.buddy_id : conversation.international_student_id;

    await createNotification(
      receiverId,
      'new_message',
      'New message',
      'You received a new message in your buddy chat.',
      'conversation',
      Number(conversationId)
    ).catch(() => null);

    return res.status(201).json({
      message: {
        id: result.rows[0].id,
        text: result.rows[0].text,
        sender: 'me',
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error("Send message error:", error.message);
    return res.status(500).json({ message: "Could not send the message." });
  }
});

export default router;
