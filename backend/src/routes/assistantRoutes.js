import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { chatWithAssistant } from "../controllers/assistantController.js";

const router = express.Router();

router.post("/chat", authenticate, chatWithAssistant);

export default router;
