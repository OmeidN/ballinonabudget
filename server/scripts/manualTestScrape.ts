// server/scripts/manualTestScrape.ts
import "../env"; // Load .env variables
import mongoose from "mongoose";
import connectMongo from "../db/mongoose";

import StoreModel from "../db/models/Store";
import ProductModel from "../db/models/Product";

const run = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await connectMongo(); // ✅ use default connect function

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
      });
    } else {
      console.log("✅ Found existing store:", store.name);
    }

    console.log("🛒 Inserting test product...");
    const testProduct = await ProductModel.create({
      name: "Organic Carrots",
      brand: "O Organics",
      size: "2 lb bag",
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
    await mongoose.disconnect(); // ✅ use directly
    console.log("🔌 Disconnected from MongoDB");
    process.exit();
  }
};

run();
