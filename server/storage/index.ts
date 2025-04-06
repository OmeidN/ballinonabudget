// 📄 server/storage/index.ts

import Product from "../db/models/Product";
import Store from "../db/models/Store";
import { getDistanceBetweenCoords } from "../utils/geo";

export interface GroceryItem {
  name: string;
  userId: number;
}

interface Location {
  lat: number;
  lng: number;
}

// Max distance (km) to consider stores "nearby"
const MAX_DISTANCE_KM = 10;

// --- STRATEGY CALCULATION ---

export async function calculateStrategies(
  groceryItemNames: string[],
  location?: Location | null
) {
  let allStores = await Store.find();

  // Filter stores by location if provided
  if (location) {
    allStores = allStores.filter((store) => {
      if (store.lat && store.lng) {
        const dist = getDistanceBetweenCoords(location, {
          lat: store.lat,
          lng: store.lng,
        });
        return dist <= MAX_DISTANCE_KM;
      }
      return false;
    });
  }

  const storeIds = allStores.map((store) => store.id.toString());

  const productDocs = await Product.find({
    name: { $in: groceryItemNames },
    storeId: { $in: storeIds },
  });

  const itemGroups = groceryItemNames.map((name) => {
    const options = productDocs.filter((p) => p.name === name);
    return { name, options };
  });

  // Option 1: Cheapest overall
  const cheapest = itemGroups.map(({ name, options }) => {
    const best = options.reduce((a, b) =>
      (a.salePrice ?? a.regularPrice) < (b.salePrice ?? b.regularPrice) ? a : b
    );
    return {
      name,
      storeId: best.storeId,
      price: best.salePrice ?? best.regularPrice,
    };
  });

  // Option 3: One-stop shop
  const allStoreIds = Array.from(new Set(productDocs.map((p) => p.storeId)));
  let oneStop: typeof cheapest = [];

  for (const storeId of allStoreIds) {
    const fromThisStore = itemGroups.map(({ name, options }) => {
      const match = options.find((p) => p.storeId === storeId);
      return match
        ? {
            name,
            storeId,
            price: match.salePrice ?? match.regularPrice,
          }
        : null;
    });

    if (fromThisStore.every((x) => x !== null)) {
      oneStop = fromThisStore as typeof cheapest;
      break;
    }
  }

  // Option 2: Balanced (use top 2–3 stores with most items)
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
    const best = valid.reduce((a, b) =>
      (a.salePrice ?? a.regularPrice) < (b.salePrice ?? b.regularPrice) ? a : b,
      valid[0]
    );
    return {
      name,
      storeId: best?.storeId,
      price: best?.salePrice ?? best?.regularPrice,
    };
  });

  return {
    cheapest,
    balanced: balancedFiltered,
    oneStop,
  };
}
