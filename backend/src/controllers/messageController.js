import {
  clearConversationForUser,
  createMessage,
  deleteMessagesForUser,
  findConversationForUser,
  findConversationsForUser,
  findMessagesInConversation,
  markMessagesAsRead,
} from '../repositories/messageRepository.js';
import { env } from "../config/env.js";
import { findRecentNotification } from "../repositories/notificationRepository.js";
import { createNotification } from '../services/notificationService.js';
import { findUserProfileById } from '../repositories/userRepository.js';
import { formatAstanaTime } from "../utils/datetime.js";
import { decryptMessagePayload, encryptMessageText } from "../utils/messageCrypto.js";

const MESSAGE_EMAIL_COOLDOWN_MINUTES = 15;

function formatMessageTime(dateValue) {
  return formatAstanaTime(dateValue);
}

function mapConversationPreview(item) {
  const previewText = item.last_message_at
    ? decryptMessagePayload({
        text: item.last_message_legacy_text,
        encrypted_text: item.last_message_encrypted_text,
        encryption_iv: item.last_message_encryption_iv,
        encryption_auth_tag: item.last_message_encryption_auth_tag,
        encryption_version: item.last_message_encryption_version,
      })
    : "";

  return {
    id: item.id,
    name: item.partner_name,
    role: item.partner_role === 'local' ? 'Buddy' : 'International Student',
    avatar:
      item.partner_avatar ||
      'https://cdn-icons-png.flaticon.com/512/149/149071.png',
    preview: previewText || 'No visible messages yet',
    unreadCount: Number(item.unread_count || 0),
  };
}

function mapConversationMessage(item, currentUserId) {
  return {
    id: item.id,
    text: decryptMessagePayload(item),
    sender: item.sender_id === currentUserId ? 'me' : 'other',
    senderName: item.sender_name,
    time: formatMessageTime(item.created_at),
    date: item.created_at,
  };
}

export async function getConversations(req, res) {
  try {
    const result = await findConversationsForUser(req.user.id);

    const conversations = result.rows.map(mapConversationPreview);

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

    const result = await findMessagesInConversation(conversationId, req.user.id);
    await markMessagesAsRead(conversationId, req.user.id);

    return res.json(
      result.rows.map((item) => mapConversationMessage(item, req.user.id))
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

    const encryptedMessage = encryptMessageText(text);
    const result = await createMessage(conversationId, req.user.id, encryptedMessage);
    const conversation = conversationCheck.rows[0];
    const recipientId =
      conversation.international_student_id === req.user.id
        ? conversation.buddy_id
        : conversation.international_student_id;
    const senderResult = await findUserProfileById(req.user.id);
    const senderName = senderResult.rows[0]?.full_name || 'A user';
    const recentNotificationResult = await findRecentNotification({
      userId: recipientId,
      type: "new_message",
      referenceType: "conversation",
      referenceId: Number(conversationId),
      withinMinutes: MESSAGE_EMAIL_COOLDOWN_MINUTES,
    });
    const shouldSendEmail = recentNotificationResult.rows.length === 0;

    await createNotification({
      userId: recipientId,
      type: 'new_message',
      title: 'New message',
      description: `${senderName} sent you a new message.`,
      referenceType: 'conversation',
      referenceId: Number(conversationId),
      sendEmail: shouldSendEmail,
      actionUrl:
        conversation.buddy_id === recipientId
          ? `${env.frontendUrl}/buddy/messages`
          : `${env.frontendUrl}/student/messages`,
    }).catch(() => null);

    return res.status(201).json({
      message: {
        id: result.rows[0].id,
        text,
        sender: 'me',
        time: formatMessageTime(result.rows[0].created_at),
        date: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error('Send message error:', error.message);
    return res.status(500).json({ message: 'Could not send the message.' });
  }
}

export async function removeMessagesForUser(req, res) {
  try {
    const { conversationId } = req.params;
    const messageIds = Array.isArray(req.body?.messageIds)
      ? req.body.messageIds
          .map((value) => Number(value))
          .filter((value) => Number.isInteger(value) && value > 0)
      : [];

    if (messageIds.length === 0) {
      return res.status(400).json({ message: 'Select at least one message.' });
    }

    const conversationCheck = await findConversationForUser(conversationId, req.user.id);

    if (conversationCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const result = await deleteMessagesForUser(conversationId, req.user.id, messageIds);

    return res.json({
      deletedMessageIds: result.rows.map((item) => item.message_id),
    });
  } catch (error) {
    console.error('Delete messages error:', error.message);
    return res.status(500).json({ message: 'Could not delete messages for this user.' });
  }
}

export async function clearMessagesForUser(req, res) {
  try {
    const { conversationId } = req.params;
    const conversationCheck = await findConversationForUser(conversationId, req.user.id);

    if (conversationCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const result = await clearConversationForUser(conversationId, req.user.id);

    return res.json({
      clearedAt: result.rows[0]?.cleared_at || null,
    });
  } catch (error) {
    console.error('Clear conversation error:', error.message);
    return res.status(500).json({ message: 'Could not clear the chat for this user.' });
  }
}
