import puppeteer from 'puppeteer';
import { Product as ProductModel, Store as StoreModel } from '../db/models';

const CATEGORY_URLS = [
  'https://www.safeway.com/shop/aisles/fruits-vegetables/fresh-vegetables-herbs.html?sort=&page=1&loc=3132',
  'https://www.safeway.com/shop/aisles/fruits-vegetables/fresh-vegetables-herbs/herbs.html?sort=&page=1&loc=3132',
  'https://www.safeway.com/shop/product-details.960138390.html'
  // Add more categories or product detail pages here
];

export async function scrapeSafeway(): Promise<{ source: string, items: { name: string; regularPrice: number; salePrice?: number; onSale?: string }[] }> {
    const browser = await puppeteer.launch({
      headless: true, // Fixes 'new' issue
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  
    const page = await browser.newPage();
    const store = await StoreModel.findOne({ name: /safeway/i });
  
    if (!store) {
      console.warn('⚠️ No Safeway store found in DB. Aborting scrape.');
      await browser.close();
      return { source: 'Safeway Scraper', items: [] };
    }
  
    const products = [];
  
    for (const url of CATEGORY_URLS) {
      console.log(`🔎 Scraping: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
      const pageProducts = await page.evaluate(() => {
        const items: any[] = [];
        const cards = document.querySelectorAll('.product-card');
  
        cards.forEach(card => {
          const name = card.querySelector('.product-title')?.textContent?.trim() ?? '';
          const priceText = card.querySelector('.product-price')?.textContent ?? '';
          const saleText = card.querySelector('.product-price__sale')?.textContent ?? '';
          const salePrice = saleText ? parseFloat(saleText.replace(/[^\d.]/g, '')) : null;
          const regularPrice = priceText ? parseFloat(priceText.replace(/[^\d.]/g, '')) : null;
          const onSale = saleText ? 'member' : null;
  
          if (name && (regularPrice || salePrice)) {
            items.push({ name, regularPrice, salePrice, onSale });
          }
        });
  
        return items;
      });
  
      products.push(...pageProducts);
      console.log(`✅ Scraped ${pageProducts.length} products from ${url}`);
    }
  
    await browser.close();
    console.log('🟢 Safeway scraping complete!');
  
    return {
      source: 'Safeway Scraper',
      items: products.map(p => ({
        name: p.name,
        regularPrice: p.regularPrice ?? 0,
        salePrice: p.salePrice ?? undefined,
        onSale: p.onSale ?? undefined
      }))
    };
  }
  