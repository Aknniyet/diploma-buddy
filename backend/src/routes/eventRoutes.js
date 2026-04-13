import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  createEventByAdmin,
  deleteEventByAdmin,
  getEventDetails,
  getEvents,
  updateEventByAdmin,
} from '../controllers/eventController.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:eventId', getEventDetails);
router.post('/', authenticate, createEventByAdmin);
router.patch('/:eventId', authenticate, updateEventByAdmin);
router.delete('/:eventId', authenticate, deleteEventByAdmin);

export default router;
