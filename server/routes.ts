// server/routes.ts
import express from "express";
import { storage } from "./storage";

const router = express.Router();

// POST /calculate - Calculate shopping strategies
router.post("/calculate", async (req, res) => {
  try {
    const groceryList: string[] = req.body.groceryItems;
    const userId = req.user?.id; // Optional if using auth middleware

    if (!groceryList || !Array.isArray(groceryList)) {
      return res.status(400).json({ error: "Invalid groceryItems array" });
    }

    const strategies = await storage.calculateStrategies({
      groceryItems: groceryList,
      userId,
    });

    res.json(strategies);
  } catch (err) {
    console.error("Error calculating strategies:", err);
    res.status(500).json({ error: "Error calculating strategies" });
  }
});

export default router;
