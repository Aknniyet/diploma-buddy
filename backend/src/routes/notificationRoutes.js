import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  readNotification,
  readAllNotifications,
  removeNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", authenticate, getNotifications);
router.patch("/:notificationId/read", authenticate, readNotification);
router.patch("/mark-all-read", authenticate, readAllNotifications);
router.delete("/:notificationId", authenticate, removeNotification);

export default router;