import mongoose from "mongoose"

const ShoppingStrategySchema = new mongoose.Schema(
  {
    userId: { type: Number, required: true },
    strategyType: { type: String, enum: ["money", "balanced", "time"], required: true },
    totalCost: { type: Number, required: true },
    regularCost: { type: Number, required: true },
    totalTime: { type: Number, required: true },
    storeCount: { type: Number, required: true },
  },
  { timestamps: true }
)

const ShoppingStrategyModel = mongoose.model("ShoppingStrategy", ShoppingStrategySchema)

export default ShoppingStrategyModel
