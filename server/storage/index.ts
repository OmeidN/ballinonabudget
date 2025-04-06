// 📄 server/storage/index.ts

import Product from "../db/models/Product";
import Store from "../db/models/Store";

// ✅ Temporary local type (replace with your own if needed)
export interface GroceryItem {
  name: string;
  userId: number;
}

// --- CRUD STUBS (optional, update as needed) ---

export async function getGroceryItems(userId: number): Promise<GroceryItem[]> {
  return []; // Replace with actual logic
}

export async function getStores() {
  return await Store.find({});
}

export async function createGroceryItem(item: GroceryItem) {
  return item; // Replace with DB logic
}

export async function deleteGroceryItem(id: number) {
  return true; // Replace with DB logic
}

// --- STRATEGY CALCULATION ---

export async function calculateStrategies(groceryItemNames: string[]) {
  const productDocs = await Product.find({
    name: { $in: groceryItemNames },
  });

  const itemGroups = groceryItemNames.map((name) => {
    const options = productDocs.filter((p) => p.name === name);
    return { name, options };
  });

  // Option 1: Cheapest overall
  const cheapest = itemGroups.map(({ name, options }) => {
    const best = options.reduce((a, b) => (a.price < b.price ? a : b));
    return { name, storeId: best.storeId, price: best.price };
  });

  // Option 3: One-stop shop
  const allStoreIds = Array.from(new Set(productDocs.map((p) => p.storeId)));
  let oneStop: typeof cheapest = [];

  for (const storeId of allStoreIds) {
    const fromThisStore = itemGroups.map(({ name, options }) => {
      const match = options.find((p) => p.storeId === storeId);
      return match ? { name, storeId, price: match.price } : null;
    });

    if (fromThisStore.every((x) => x !== null)) {
      oneStop = fromThisStore as typeof cheapest;
      break;
    }
  }

  // Option 2: Balanced (cheapest within top 2–3 stores)
  const storeUseCount: Record<string, number> = {};
  cheapest.forEach((item) => {
    storeUseCount[item.storeId] = (storeUseCount[item.storeId] || 0) + 1;
  });

  const topStores = Object.entries(storeUseCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  const balancedFiltered = itemGroups.map(({ name, options }) => {
    const valid = options.filter((p) => topStores.includes(p.storeId));
    const best = valid.reduce((a, b) => (a.price < b.price ? a : b), valid[0]);
    return { name, storeId: best?.storeId, price: best?.price };
  });

  return {
    cheapest,
    balanced: balancedFiltered,
    oneStop,
  };
}
