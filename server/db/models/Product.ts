// 📄 server/models/Product.ts

import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String },
  size: { type: String },
  price: { type: Number, required: true },
  memberPrice: { type: Number },
  imageUrl: { type: String },
  category: { type: String, required: true },
  storeId: { type: String, required: true, index: true },
  storeName: { type: String },
  url: { type: String },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model("Product", productSchema);
