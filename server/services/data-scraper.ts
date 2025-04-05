import { geminiService } from './index';
import { Store as StoreModel, Product as ProductModel, ScrapedData as ScrapedDataModel } from '../db/models';
import mongoose from 'mongoose';

// Store URLs to scrape
const storeUrls: { [storeName: string]: string } = {
  "Trader Joe's": "https://www.traderjoes.com/home/products/category/food-8",
  "Kroger": "https://www.kroger.com/savings/cl/weeklyad",
  "Walmart": "https://www.walmart.com/cp/grocery/131943",
  "Publix": "https://www.publix.com/savings/weekly-ad"
};

/**
 * Initialize stores in the database (clean version for scalable setup)
 * No stores will be added here. All store creation should come from scrapers or admin routes.
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
    
    for (const store of stores) {
      // Ensure we have the right type for the store
      const typedStore = store as any;
      const storeUrl = storeUrls[typedStore.name];
      
      if (!storeUrl) {
        console.log(`No URL configured for ${typedStore.name}, skipping...`);
        continue;
      }
      
      console.log(`Scraping data for ${typedStore.name} from ${storeUrl}...`);
      
      const scrapedData = await geminiService.scrapeGroceryData(storeUrl, typedStore.name);
      
      if (!scrapedData) {
        console.log(`Failed to scrape data for ${typedStore.name}`);
        continue;
      }
      
      // Save the scraped data
      const newScrapedData = new ScrapedDataModel({
        storeId: new mongoose.Types.ObjectId(typedStore._id.toString()),
        source: scrapedData.source,
        rawData: scrapedData,
        processedData: scrapedData.items,
        scrapedAt: new Date(),
        isValid: true
      });
      
      await newScrapedData.save();
      console.log(`Saved scraped data for ${typedStore.name}`);
      
      // Update or create products based on scraped data
      await updateProducts(typedStore._id.toString(), scrapedData.items);
      
      console.log(`Completed scraping for ${typedStore.name}`);
    }
    
    console.log('All stores scraped successfully');
  } catch (error) {
    console.error('Error scraping stores:', error);
  }
}

/**
 * Update product data based on scraped items
 */
async function updateProducts(
  storeId: mongoose.Types.ObjectId | string, 
  items: { name: string; regularPrice: number; salePrice?: number; onSale?: string }[]
): Promise<void> {
  // Convert storeId to ObjectId if it's a string
  const storeObjectId = typeof storeId === 'string' 
    ? new mongoose.Types.ObjectId(storeId)
    : storeId;
  try {
    for (const item of items) {
      // Check if product already exists
      const existingProduct = await ProductModel.findOne({
        storeId: storeObjectId,
        name: item.name
      });
      
      if (existingProduct) {
        // Update existing product
        existingProduct.regularPrice = item.regularPrice;
        existingProduct.salePrice = item.salePrice;
        existingProduct.onSale = item.onSale;
        existingProduct.lastUpdated = new Date();
        existingProduct.scraped = true;
        
        await existingProduct.save();
        console.log(`Updated product: ${item.name} at ${storeObjectId}`);
      } else {
        // Create new product
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
        console.log(`Created product: ${item.name} at ${storeObjectId}`);
      }
    }
    
    console.log(`Updated ${items.length} products for store ${storeObjectId}`);
  } catch (error) {
    console.error('Error updating products:', error);
  }
}

export default {
  initializeStores,
  scrapeAllStores
};