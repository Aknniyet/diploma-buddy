import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getConversationMessages,
  getConversations,
  sendMessage,
} from '../controllers/messageController.js';

const router = express.Router();

router.get('/conversations', authenticate, getConversations);
router.get('/conversations/:conversationId/messages', authenticate, getConversationMessages);
router.post('/conversations/:conversationId/messages', authenticate, sendMessage);

export default router;
