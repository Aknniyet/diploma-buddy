import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { getAdminDashboard } from "../controllers/adminController.js";
import {
  addAdminMatchNote,
  approveRequestByAdmin,
  changeBuddyStatusByAdmin,
  changeMatchStatusByAdmin,
  createManualMatchByAdmin,
  getAdminMatchesOverview,
  getMatchNotesByAdmin,
  reassignMatchByAdmin,
} from "../controllers/adminMatchController.js";

const router = express.Router();

router.get("/dashboard", authenticate, getAdminDashboard);
router.get("/matches", authenticate, getAdminMatchesOverview);
router.post("/requests/:requestId/approve", authenticate, approveRequestByAdmin);
router.post("/matches/manual", authenticate, createManualMatchByAdmin);
router.patch("/buddies/:buddyId/status", authenticate, changeBuddyStatusByAdmin);
router.patch("/matches/:matchId/status", authenticate, changeMatchStatusByAdmin);
router.patch("/matches/:matchId/reassign", authenticate, reassignMatchByAdmin);
router.post("/matches/notes", authenticate, addAdminMatchNote);
router.get("/matches/:matchId/notes", authenticate, getMatchNotesByAdmin);

export default router;
