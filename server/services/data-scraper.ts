// 📄 server/services/data-scraper.ts

import { scrapeStore } from "../scrapers";
import { ScrapedProduct } from "../scrapers/types";
import Product from "../db/models/Product";
import mongoose from "mongoose";

/**
 * Scrapes data for a given store and optional category URL,
 * then stores it in MongoDB.
 */
export async function runScraper(storeId: string, categoryUrl?: string): Promise<ScrapedProduct[]> {
  try {
    const products = await scrapeStore(storeId, categoryUrl);

    const operations = products.map((product: ScrapedProduct) => ({
      updateOne: {
        filter: {
          name: product.name,
          size: product.size,
          storeId: product.storeId,
        },
        update: { $set: product },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await Product.bulkWrite(operations);
      console.log(`[✔] ${operations.length} products upserted for ${storeId}`);
    }

    return products;
  } catch (err) {
    console.error(`[✘] Failed to scrape ${storeId}:`, err);
    throw err;
  }
}

/**
 * Placeholder for store initialization.
 */
export async function initializeStores(): Promise<void> {
  console.log("✅ [initializeStores] Placeholder ran");
  // TODO: Add logic to initialize/store metadata in MongoDB
}

/**
 * Placeholder to scrape all registered stores.
 */
export async function scrapeAllStores(): Promise<void> {
  console.log("✅ [scrapeAllStores] Placeholder ran");
  // TODO: Pull all store records and invoke their scrapers
}
