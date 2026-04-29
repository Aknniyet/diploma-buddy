import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  createRequest,
  getAvailableBuddies,
  getMyFeedbackOverview,
  getIncomingRequests,
  getMyMatches,
  getMyRequests,
  respondToRequest,
  saveBuddyFeedback,
} from '../controllers/buddyController.js';

const router = express.Router();

router.get('/available', authenticate, getAvailableBuddies);
router.post('/requests', authenticate, createRequest);
router.get('/requests/my', authenticate, getMyRequests);
router.get('/requests/incoming', authenticate, getIncomingRequests);
router.patch('/requests/:requestId/respond', authenticate, respondToRequest);
router.get('/matches/my', authenticate, getMyMatches);
router.post('/feedback', authenticate, saveBuddyFeedback);
router.get('/feedback/my-summary', authenticate, getMyFeedbackOverview);

export default router;
