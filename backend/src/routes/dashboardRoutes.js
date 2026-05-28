import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getBuddyDashboard,
  getStudentDashboard,
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/student', authenticate, getStudentDashboard);
router.get('/buddy', authenticate, getBuddyDashboard);

export default router;
