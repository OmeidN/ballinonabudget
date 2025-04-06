import { scrapeSafeway } from '../scrapers/safeway';
import { Store as StoreModel, Product as ProductModel, ScrapedData as ScrapedDataModel } from '../db/models';
import mongoose from 'mongoose';
import { geminiService } from './index';

// Define types
type ScrapedItem = {
  name: string;
  regularPrice: number;
  salePrice?: number;
  onSale?: string;
};

type ScrapedData = {
  source: string;
  items: ScrapedItem[];
};

// Store URLs for Gemini fallback
const storeUrls: { [storeName: string]: string } = {
  "Safeway": "https://www.safeway.com/",
  "Trader Joe's": "https://www.traderjoes.com/home/products/category/food-8",
  "Kroger": "https://www.kroger.com/savings/cl/weeklyad",
  "Walmart": "https://www.walmart.com/cp/grocery/131943",
  "Publix": "https://www.publix.com/savings/weekly-ad"
};

/**
 * Initialize stores in the database
 */
export async function initializeStores(): Promise<void> {
  try {
    const storeCount = await StoreModel.countDocuments();

    if (storeCount > 0) {
      console.log(`${storeCount} stores already exist in the database.`);
    } else {
      console.log("No stores initialized. Use dynamic scrapers or admin routes to add stores.");
    }
  } catch (error) {
    console.error('Error initializing stores:', error);
  }
}

/**
 * Scrape all stores and update product data
 */
export async function scrapeAllStores(): Promise<void> {
  try {
    const stores = await StoreModel.find();

    for (const store of stores as (mongoose.Document & { _id: mongoose.Types.ObjectId; name: string })[]) {
      const storeName = store.name;
      const storeUrl = storeUrls[storeName];

      if (!storeUrl) {
        console.log(`No URL configured for ${storeName}, skipping...`);
        continue;
      }

      console.log(`Scraping data for ${storeName} from ${storeUrl}...`);

      let scrapedData: ScrapedData | null = null;

      if (storeName.toLowerCase().includes("safeway")) {
        const items = await scrapeSafeway() as ScrapedItem[];
        scrapedData = {
          source: 'safeway',
          items
        };
      } else {
        scrapedData = await geminiService.scrapeGroceryData(storeUrl, storeName);
      }

      if (!scrapedData) {
        console.log(`❌ Failed to scrape data for ${storeName}`);
        continue;
      }

      const newScrapedData = new ScrapedDataModel({
        storeId: store._id,
        source: scrapedData.source,
        rawData: scrapedData as any,
        processedData: scrapedData.items,
        scrapedAt: new Date(),
        isValid: true
      });

      await newScrapedData.save();
      console.log(`📦 Saved scraped snapshot for ${storeName}`);

      await updateProducts(store._id, scrapedData.items);
      console.log(`✅ Completed scraping for ${storeName}`);
    }

    console.log('🎉 All stores scraped successfully');
  } catch (error) {
    console.error('❌ Error scraping stores:', error);
  }
}

/**
 * Upsert product records for a given store
 */
async function updateProducts(
  storeId: mongoose.Types.ObjectId | string,
  items: ScrapedItem[]
): Promise<void> {
  const storeObjectId = typeof storeId === 'string'
    ? new mongoose.Types.ObjectId(storeId)
    : storeId;

  try {
    for (const item of items) {
      const existingProduct = await ProductModel.findOne({
        storeId: storeObjectId,
        name: item.name
      });

      if (existingProduct) {
        existingProduct.regularPrice = item.regularPrice;
        existingProduct.salePrice = item.salePrice;
        existingProduct.onSale = item.onSale;
        existingProduct.lastUpdated = new Date();
        existingProduct.scraped = true;

        await existingProduct.save();
        console.log(`🔁 Updated product: ${item.name}`);
      } else {
        const newProduct = new ProductModel({
          name: item.name,
          storeId: storeObjectId,
          regularPrice: item.regularPrice,
          salePrice: item.salePrice,
          onSale: item.onSale,
          lastUpdated: new Date(),
          scraped: true
        });

        await newProduct.save();
        console.log(`🆕 Created product: ${item.name}`);
      }
    }

    console.log(`✅ ${items.length} products processed for store ${storeObjectId}`);
  } catch (error) {
    console.error('❌ Error updating products:', error);
  }
}

export default {
  initializeStores,
  scrapeAllStores
};
