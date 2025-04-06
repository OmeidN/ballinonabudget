// 📄 server/scrapers/types.ts

export interface ScrapedProduct {
    name: string;
    brand?: string;
    size?: string;
    price: number;
    memberPrice?: number;
    imageUrl?: string;
    category: string;
    storeId: string;
    storeName: string;
    url?: string;
    lastUpdated: Date;
  }
  