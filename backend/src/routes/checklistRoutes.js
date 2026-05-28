import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createTask,
  deleteTask,
  getChecklist,
  toggleTask,
  updateTask,
} from "../controllers/checklistController.js";

const router = express.Router();

router.get("/", authenticate, getChecklist);
router.post("/", authenticate, createTask);
router.patch("/:taskId/toggle", authenticate, toggleTask);
router.patch("/:taskId", authenticate, updateTask);
router.delete("/:taskId", authenticate, deleteTask);

export default router;
