import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getMyProfile, updateMyProfile } from '../controllers/profileController.js';

const router = express.Router();

router.get('/me', authenticate, getMyProfile);
router.put('/me', authenticate, updateMyProfile);

export default router;
