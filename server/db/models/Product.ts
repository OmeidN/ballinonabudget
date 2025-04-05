import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  storeId: mongoose.Types.ObjectId;
  regularPrice: number;
  salePrice?: number;
  onSale?: string;  // For any sale description
  lastUpdated: Date;
  scraped: boolean;  // Indicates if this was scraped from Gemini API
}

const ProductSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  regularPrice: {
    type: Number,
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    min: 0
  },
  onSale: {
    type: String,
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  scraped: {
    type: Boolean,
    default: false
  }
});

// Add indexes for faster lookups
ProductSchema.index({ storeId: 1 });
ProductSchema.index({ name: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);