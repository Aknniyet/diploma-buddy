import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  createEventByAdmin,
  deleteEventByAdmin,
  getEventDetails,
  getEvents,
  toggleEventAttendanceByUser,
  updateEventByAdmin,
} from '../controllers/eventController.js';

const router = express.Router();

router.get('/', authenticate, getEvents);
router.get('/:eventId', authenticate, getEventDetails);
router.post('/:eventId/attendance', authenticate, toggleEventAttendanceByUser);
router.post('/', authenticate, createEventByAdmin);
router.patch('/:eventId', authenticate, updateEventByAdmin);
router.delete('/:eventId', authenticate, deleteEventByAdmin);

export default router;
