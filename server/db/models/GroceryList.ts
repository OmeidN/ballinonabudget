import mongoose, { Schema, Document } from 'mongoose';

export interface IGroceryItem {
  name: string;
  quantity?: number;
  completed?: boolean;
}

export interface IGroceryList extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  items: IGroceryItem[];
  createdAt: Date;
  updatedAt: Date;
}

const GroceryItemSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  completed: {
    type: Boolean,
    default: false
  }
});

const GroceryListSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'My Shopping List'
  },
  items: [GroceryItemSchema]
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Add indexes for faster lookups
GroceryListSchema.index({ userId: 1 });

export default mongoose.model<IGroceryList>('GroceryList', GroceryListSchema);