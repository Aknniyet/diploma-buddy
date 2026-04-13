import {
  createMessage,
  findConversationForUser,
  findConversationsForUser,
  findMessagesInConversation,
  markMessagesAsRead,
} from '../repositories/messageRepository.js';
import { createNotification } from '../repositories/notificationRepository.js';
import { findUserProfileById } from '../repositories/userRepository.js';

function formatMessageTime(dateValue) {
  return new Date(dateValue).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function getConversations(req, res) {
  try {
    const result = await findConversationsForUser(req.user.id);

    const conversations = result.rows.map((item) => ({
      id: item.id,
      name: item.partner_name,
      role: item.partner_role === 'local' ? 'Buddy' : 'International Student',
      avatar:
        item.partner_avatar ||
        'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      preview: item.last_message_text || 'No messages yet',
      unreadCount: Number(item.unread_count || 0),
    }));

    return res.json(conversations);
  } catch (error) {
    console.error('Conversations error:', error.message);
    return res.status(500).json({ message: 'Could not load conversations.' });
  }
}

export async function getConversationMessages(req, res) {
  try {
    const { conversationId } = req.params;
    const conversationCheck = await findConversationForUser(conversationId, req.user.id);

    if (conversationCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const result = await findMessagesInConversation(conversationId);
    await markMessagesAsRead(conversationId, req.user.id);

    return res.json(
      result.rows.map((item) => ({
        id: item.id,
        text: item.text,
        sender: item.sender_id === req.user.id ? 'me' : 'other',
        senderName: item.sender_name,
        time: formatMessageTime(item.created_at),
        date: item.created_at,
      }))
    );
  } catch (error) {
    console.error('Messages error:', error.message);
    return res.status(500).json({ message: 'Could not load messages.' });
  }
}

export async function sendMessage(req, res) {
  try {
    const { conversationId } = req.params;
    const text = req.body.text?.trim();

    if (!text) {
      return res.status(400).json({ message: 'Message text is required.' });
    }

    const conversationCheck = await findConversationForUser(conversationId, req.user.id);
    if (conversationCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const result = await createMessage(conversationId, req.user.id, text);
    const conversation = conversationCheck.rows[0];
    const recipientId =
      conversation.international_student_id === req.user.id
        ? conversation.buddy_id
        : conversation.international_student_id;
    const senderResult = await findUserProfileById(req.user.id);
    const senderName = senderResult.rows[0]?.full_name || 'A user';

    await createNotification({
      userId: recipientId,
      type: 'new_message',
      title: 'New message',
      description: `${senderName} sent you a new message.`,
      referenceType: 'conversation',
      referenceId: Number(conversationId),
    }).catch(() => null);

    return res.status(201).json({
      message: {
        id: result.rows[0].id,
        text: result.rows[0].text,
        sender: 'me',
        time: formatMessageTime(result.rows[0].created_at),
      },
    });
  } catch (error) {
    console.error('Send message error:', error.message);
    return res.status(500).json({ message: 'Could not send the message.' });
  }
}
