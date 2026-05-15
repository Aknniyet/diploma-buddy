import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  clearMessagesForUser,
  getConversationMessages,
  getConversations,
  removeMessagesForUser,
  sendMessage,
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/conversations', authenticate, getConversations);
router.get('/conversations/:conversationId/messages', authenticate, getConversationMessages);
router.post('/conversations/:conversationId/messages', authenticate, sendMessage);
router.delete('/conversations/:conversationId/messages', authenticate, removeMessagesForUser);
router.post('/conversations/:conversationId/clear', authenticate, clearMessagesForUser);

export default router;
