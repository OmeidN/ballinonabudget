// 📄 server/index.ts

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import strategyRoutes from "./routes/strategy.routes";


import productsRouter from "./routes/products";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productsRouter);
app.use("/api/strategies", strategyRoutes);


// Root endpoint (optional)
app.get("/", (req, res) => {
  res.send("🛒 BallinOnABudget API is running");
});

// MongoDB connection
async function startServer() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is missing from .env");

    await mongoose.connect(uri, {
      dbName: "ballinonabudget",
    });

    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
}

startServer();
