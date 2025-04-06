// 📄 server/utils/db.ts

import mongoose from "mongoose";

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("⚠️  MONGODB_URI not set in .env file");
  }

  try {
    await mongoose.connect(uri, {
      dbName: "grocery-app",
    });
    isConnected = true;
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}
