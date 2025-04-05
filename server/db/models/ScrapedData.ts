import mongoose, { Schema, Document } from 'mongoose';

export interface IScrapedData extends Document {
  storeId: mongoose.Types.ObjectId;
  source: string;  // URL of the scraped page
  rawData: any;    // Raw response from Gemini
  processedData: any; // Processed and structured data
  scrapedAt: Date;
  isValid: boolean;
}

const ScrapedDataSchema: Schema = new Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  rawData: {
    type: Schema.Types.Mixed,
    required: true
  },
  processedData: {
    type: Schema.Types.Mixed,
    required: true
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  isValid: {
    type: Boolean,
    default: true
  }
});

// Add index for faster lookups
ScrapedDataSchema.index({ storeId: 1, scrapedAt: -1 });

export default mongoose.model<IScrapedData>('ScrapedData', ScrapedDataSchema);