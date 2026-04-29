import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  createCommunityCommentByMember,
  createCommunityPostByStudent,
  deleteCommunityCommentByAuthor,
  deleteCommunityPostByAuthor,
  getCommunityPosts,
  toggleCommunityInterest,
  updateCommunityPostByAuthor,
} from "../controllers/communityController.js";

const router = express.Router();

router.get("/posts", authenticate, getCommunityPosts);
router.post("/posts", authenticate, createCommunityPostByStudent);
router.patch("/posts/:postId", authenticate, updateCommunityPostByAuthor);
router.delete("/posts/:postId", authenticate, deleteCommunityPostByAuthor);
router.post("/posts/:postId/interest", authenticate, toggleCommunityInterest);
router.post("/posts/:postId/comments", authenticate, createCommunityCommentByMember);
router.delete("/comments/:commentId", authenticate, deleteCommunityCommentByAuthor);

export default router;
