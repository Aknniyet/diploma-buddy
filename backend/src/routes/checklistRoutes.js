import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getChecklist, toggleTask } from "../controllers/checklistController.js";

const router = express.Router();

router.get("/", authenticate, getChecklist);
router.patch("/:taskId/toggle", authenticate, toggleTask);

export default router;