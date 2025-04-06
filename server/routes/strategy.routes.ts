// /server/routes/strategy.routes.ts

import express from "express";
import { z } from "zod";
import { storage } from "../storage";
import { strategyItemSchema } from "../../shared/schema";

const router = express.Router();

const saveStrategySchema = z.object({
  userId: z.number(),
  strategyType: z.enum(["money", "balanced", "time"]),
  items: z.array(strategyItemSchema),
});

// POST /api/strategies/save
router.post("/save", async (req, res) => {
  try {
    const parsed = saveStrategySchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() });
    }

    const saved = await storage.saveStrategy(parsed.data);
    res.json(saved);
  } catch (err) {
    console.error("Error saving strategy:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
