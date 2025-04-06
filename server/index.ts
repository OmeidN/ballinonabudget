// server/index.ts or server.ts
import "dotenv/config"; // Load env vars
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./routes";

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// Attach routes
app.use("/api", routes);

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    if (!MONGODB_URI) throw new Error("MONGODB_URI not defined in .env");

    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
