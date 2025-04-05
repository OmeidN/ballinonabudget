import dotenv from 'dotenv';

dotenv.config();

// Check if the GEMINI_API_KEY is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface GeminiScrapingResult {
  items: {
    name: string;
    regularPrice: number;
    salePrice?: number;
    onSale?: string;
  }[];
  store: string;
  source: string;
  scrapedTime: string;
}

/**
 * Scrape grocery data from store websites using Gemini API
 * @param storeUrl The URL of the store website or weekly ad
 * @param storeName The name of the store
 * @returns Scraped grocery data
 */
export async function scrapeGroceryData(storeUrl: string, storeName: string): Promise<GeminiScrapingResult | null> {
  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not available. Please set it in your environment variables.');
    return null;
  }

  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    const prompt = `
      You are a specialized web scraping agent for grocery store pricing.
      
      Visit this URL: ${storeUrl}
      
      Extract all grocery items with their pricing information. For each item, include:
      1. Item name
      2. Regular price
      3. Sale price (if available)
      4. Any special deals or coupons (if available)
      
      Please format the response as a structured JSON object with these fields:
      {
        "items": [
          {
            "name": "item name",
            "regularPrice": regular price as a number,
            "salePrice": sale price as a number (if available),
            "onSale": description of the sale (if available)
          }
        ],
        "store": "${storeName}",
        "source": "${storeUrl}",
        "scrapedTime": current date and time
      }
      
      Only return the JSON, no other text.
    `;

    const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return null;
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON response
    try {
      const result: GeminiScrapingResult = JSON.parse(generatedText);
      return result;
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

export default { scrapeGroceryData };