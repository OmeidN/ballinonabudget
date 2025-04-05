import puppeteer from 'puppeteer';
import StoreModel from '../db/models/Store';

const safewayLocation = {
  name: 'Safeway - Daly City',
  address: '601 Westlake Center, Daly City, CA 94015',
  lat: 37.6879,
  lng: -122.4702
};

async function ensureSafewayStore() {
  const existing = await StoreModel.findOne({ name: safewayLocation.name });

  if (!existing) {
    const newStore = new StoreModel({
      name: safewayLocation.name,
      address: safewayLocation.address,
      lat: safewayLocation.lat,
      lng: safewayLocation.lng,
      location: {
        type: 'Point',
        coordinates: [safewayLocation.lng, safewayLocation.lat],
      }
    });

    await newStore.save();
    console.log(`✅ Safeway store created at ${safewayLocation.address}`);
  } else {
    console.log(`⚠️ Safeway store already exists.`);
  }
}

export async function scrapeSafewayWeeklyAd(): Promise<{ source: string; items: any[] }> {
  await ensureSafewayStore();

  console.log("🟡 Launching Puppeteer...");
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  console.log("🟢 Puppeteer launched successfully!");

  // ✅ Reuse first tab instead of opening a new one
  const [page] = await browser.pages();

  await page.goto('https://www.safeway.com/weeklyad', { waitUntil: 'networkidle2' });

  try {
    await page.waitForSelector('input[type="tel"]', { timeout: 5000 });
    await page.type('input[type="tel"]', '94015');
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
  } catch (err) {
    console.log('✅ ZIP prompt skipped or already handled');
  }

  // Adjust selector based on what loads on the final weekly ad page
  await page.waitForSelector('.product-details', { timeout: 15000 });

  const items = await page.$$eval('.product-details', elements =>
    elements.map(el => {
      const name = el.querySelector('.product-title')?.textContent?.trim() || '';
      const price = el.querySelector('.product-price')?.textContent?.trim() || '';
      return { name, price };
    })
  );

  console.log(`🛒 Found ${items.length} Safeway products`);
  if (items.length > 0) {
    console.log('🧪 First product:', items[0]);
  }

  await new Promise(res => setTimeout(res, 3000)); // optional: give time to view browser
  console.log("🛑 Closing browser...");
  await browser.close();

  return {
    source: 'Safeway Weekly Ad',
    items
  };
}
