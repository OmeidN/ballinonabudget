import express from "express";
import { storage } from "./storage";

const router = express.Router();

// Example route: Calculate strategies based on grocery items
router.post("/calculate", async (req, res) => {
  try {
    const groceryList = req.body.groceryItems; // this should be an array of strings
    const userId = req.user?.id; // optional user id if using auth

    const strategies = await storage.calculateStrategies({
      groceryItems: groceryList,
      userId,
    });

    res.json(strategies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error calculating strategies" });
  }
});

export default router;
