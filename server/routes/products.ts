// 📄 server/routes/products.ts

import express from "express";
import Product from "../db/models/Product";

const router = express.Router();

/**
 * GET /api/products/search?query=apple
 * Returns up to 10 matching products based on name/category
 */
router.get("/search", async (req, res) => {
  const query = req.query.query?.toString().trim();

  if (!query) {
    return res.status(400).json({ error: "Missing query" });
  }

  try {
    const regex = new RegExp(query, "i");

    const results = await Product.find({
      $or: [
        { name: { $regex: regex } },
        { category: { $regex: regex } },
      ],
    })
      .limit(10)
      .lean();

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
