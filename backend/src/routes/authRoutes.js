import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  forgotPassword,
  getCurrentUser,
  login,
  register,
  registerStart,
  registerVerify,
  resendVerificationCode,
  resetPassword,
  verifyEmail,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/register/start", registerStart);
router.post("/register/verify", registerVerify);
router.post("/register/resend-code", resendVerificationCode);
router.post("/email/verify", verifyEmail);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authenticate, getCurrentUser);

export default router;
