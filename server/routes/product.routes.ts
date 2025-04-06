// server/routes/product.routes.ts
import express from "express";
import { storage } from "../storage";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await storage.getProducts();
    res.json(products);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

export default router;
