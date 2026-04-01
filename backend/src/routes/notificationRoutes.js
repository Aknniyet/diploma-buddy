import express from "express";
import { query } from "../config/db.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, type, title, description, reference_type, reference_id, is_read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json(result.rows.map((item) => ({
      ...item,
      read: item.is_read,
    })));
  } catch (error) {
    console.error("Notifications error:", error.message);
    return res.status(500).json({ message: "Could not load notifications." });
  }
});

router.patch("/:notificationId/read", authenticate, async (req, res) => {
  try {
    const { notificationId } = req.params;
    await query(
      `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
      [notificationId, req.user.id]
    );

    return res.json({ message: "Notification marked as read." });
  } catch (error) {
    console.error("Mark notification read error:", error.message);
    return res.status(500).json({ message: "Could not update notification." });
  }
});

router.patch("/mark-all-read", authenticate, async (req, res) => {
  try {
    await query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1`, [req.user.id]);
    return res.json({ message: "All notifications marked as read." });
  } catch (error) {
    console.error("Mark all notifications read error:", error.message);
    return res.status(500).json({ message: "Could not update notifications." });
  }
});

router.delete("/:notificationId", authenticate, async (req, res) => {
  try {
    const { notificationId } = req.params;
    await query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [notificationId, req.user.id]);
    return res.json({ message: "Notification deleted." });
  } catch (error) {
    console.error("Delete notification error:", error.message);
    return res.status(500).json({ message: "Could not delete notification." });
  }
});

export default router;
