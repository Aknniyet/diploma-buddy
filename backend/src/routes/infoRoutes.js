import express from "express";
import { query } from "../config/db.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const result = await query(
      `SELECT id, title, content, category
       FROM useful_information
       ORDER BY created_at DESC`
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("Useful info error:", error.message);
    return res.status(500).json({ message: "Could not load information." });
  }
});

export default router;
