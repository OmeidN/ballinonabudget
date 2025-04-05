import puppeteer from 'puppeteer-core';
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

export async function scrapeSafewayWeeklyAd(): Promise<any[]> {
  await ensureSafewayStore();

  const browser = await puppeteer.launch({
    headless: false, // for debugging — change to true later
    executablePath: process.platform === 'win32' ? undefined : '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Step 1: Go to weekly ad home
  await page.goto('https://weeklyad.safeway.com/', { waitUntil: 'networkidle2' });

  // Step 2: Enter ZIP code if prompted
  try {
    await page.waitForSelector('input[type="tel"]', { timeout: 5000 });
    await page.type('input[type="tel"]', '94015');
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
  } catch (err) {
    console.log('✅ ZIP prompt skipped or already handled');
  }

  // Step 3: Wait for ad products to load
  await page.waitForSelector('.item-details', { timeout: 15000 });

  // Step 4: Scrape products
  const items = await page.$$eval('.item-details', productEls =>
    productEls.map(el => {
      const name = el.querySelector('.item-name')?.textContent?.trim() || '';
      const price = el.querySelector('.pricing')?.textContent?.trim() || '';
      return { name, price };
    })
  );

  console.log(`🛒 Found ${items.length} Safeway products`);
  console.log('🧪 First product:', items[0]);

  await browser.close();
  return items;
}
