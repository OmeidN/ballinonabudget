import { scrapeSafeway } from './safeway';

export const scrapers: { [storeName: string]: () => Promise<{ source: string, items: any[] }> } = {
  'Safeway - Daly City': scrapeSafeway
};
