import mongoose, { Schema, Document } from "mongoose";

export interface IGroceryItem extends Document {
  userId: number;
  name: string;
  quantity?: number;
  completed?: boolean;
  createdAt: Date;
}

const GroceryItemSchema = new Schema<IGroceryItem>({
  userId: { type: Number, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IGroceryItem>("GroceryItem", GroceryItemSchema);
