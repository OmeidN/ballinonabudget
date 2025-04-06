// 📄 server/scripts/test-safeway-scraper.ts
require("dotenv").config({ path: "./.env" });
require("dotenv").config();

const { runScraper } = require("../services/data-scraper");
const { connectToDatabase } = require("../utils/db");

async function main() {
  try {
    await connectToDatabase();
    await runScraper("safeway");
    console.log("✅ Scraping completed!");
  } catch (err) {
    console.error("❌ Scraping failed:", err);
  } finally {
    process.exit(0);
  }
}

main();
