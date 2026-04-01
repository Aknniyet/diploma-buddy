import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, title, description, event_date, location, category
       FROM events
       ORDER BY event_date ASC`
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Events error:", error.message);
    return res.status(500).json({ message: "Could not load events." });
  }
});

export default router;
