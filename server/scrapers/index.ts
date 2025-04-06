// 📄 server/scrapers/index.ts

import { scrapeSafeway } from "./safeway";
import { ScrapedProduct } from "./types";

// ✅ Individual scrapers
export const scrapers: Record<string, (categoryUrl?: string) => Promise<ScrapedProduct[]>> = {
  safeway: scrapeSafeway,
  // Add other store scrapers here
};

// ✅ Dynamic scraper router
export function scrapeStore(storeId: string, categoryUrl?: string): Promise<ScrapedProduct[]> {
  const scraper = scrapers[storeId.toLowerCase()];
  if (!scraper) {
    throw new Error(`No scraper found for store: ${storeId}`);
  }

  return scraper(categoryUrl);
}
