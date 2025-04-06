// server/scripts/manualTestScrape.ts
import "../env"; // Load .env variables
import mongoose from "mongoose";
import { connectToDatabase } from "../db/mongoose";

import StoreModel from "../db/models/Store";
import ProductModel from "../db/models/Product";

const run = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await connectToDatabase(); // ✅ call correct function

    const storeName = "Safeway";
    let store = await StoreModel.findOne({ name: storeName });

    if (!store) {
      console.log("📦 Creating test store (Safeway)...");
      store = await StoreModel.create({
        name: storeName,
        address: "123 Main St, San Francisco, CA",
        lat: 37.7749,
        lng: -122.4194,
        distance: 0,
        travelTime: 0,
        location: {
            type: "Point",
            coordinates: [-122.4194, 37.7749], // [lng, lat]
          },        
      });
    } else {
      console.log("✅ Found existing store:", store.name);
    }

    console.log("🛒 Inserting test product...");
    const testProduct = await ProductModel.create({
      name: "Organic Carrots",
      brand: "O Organics",
      category: "Vegetables", // ✅ NEW
      size: "2 lb bag",
      price: 2.49 !== undefined ? 2.49 : 3.99, // more robust in case salePrice is missing
      regularPrice: 3.99,
      salePrice: 2.49,
      onSale: "yes",
      storeId: store._id,
      lastUpdated: new Date(),
      scraped: true,
    });

    console.log("✅ Test product saved:");
    console.log(testProduct);

  } catch (err) {
    console.error("❌ Error during test scrape:", err);
  } finally {
    await mongoose.disconnect(); // Disconnect cleanly
    console.log("🔌 Disconnected from MongoDB");
    process.exit();
  }
};

run();
