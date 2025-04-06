// 📄 server/scrapers/safeway.ts

import puppeteer from "puppeteer";
import { ScrapedProduct } from "./types";

export async function scrapeSafeway(categoryUrl?: string): Promise<ScrapedProduct[]> {
  const url = categoryUrl || "https://www.safeway.com/shop/aisles/meat-seafood.html?loc=3132://www.safeway.com/shop/aisles/fresh-produce/vegetables.3130.html";

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "domcontentloaded" });

  const products: ScrapedProduct[] = await page.evaluate(() => {
    const items: ScrapedProduct[] = [];

    const productEls = document.querySelectorAll(".product-card-container");

    productEls.forEach((el) => {
      const name = el.querySelector(".product-title")?.textContent?.trim() || "";
      const brand = el.querySelector(".product-brand")?.textContent?.trim() || "";
      const size = el.querySelector(".product-size")?.textContent?.trim() || "";
      const priceText = el.querySelector(".product-price")?.textContent?.replace(/[^0-9.]/g, "");
      const imageUrl = (el.querySelector("img") as HTMLImageElement)?.src || "";

      const price = priceText ? parseFloat(priceText) : NaN;

      if (!isNaN(price)) {
        items.push({
          name,
          brand,
          size,
          price,
          category: "vegetables",
          storeId: "safeway",
          storeName: "Safeway",
          imageUrl,
          lastUpdated: new Date(),
        });
      }
    });

    return items;
  });

  await browser.close();
  return products;
}
