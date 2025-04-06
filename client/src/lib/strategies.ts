// client/src/lib/strategies.ts

import {
  StrategyItem,
  ShoppingStrategyResult,
  Store,
  StoreWithItems,
  CalculateStrategiesResponse,
} from "@/lib/types";

/**
 * Dummy version of calculateStrategies — to be replaced with real API call
 */
export const calculateStrategies = async (
  groceryItems: string[]
): Promise<CalculateStrategiesResponse> => {
  const mockStore: Store = {
    id: 1,
    name: "Safeway",
    address: "123 Main St",
    lat: 0,
    lng: 0,
    distance: 0,
    travelTime: 0,
  };

  const mockItems: StrategyItem[] = groceryItems.map((name, i) => ({
    productId: i,
    productName: name,
    storeId: mockStore.id,
    storeName: mockStore.name,
    regularPrice: 3.99,
    salePrice: i % 2 === 0 ? 2.99 : null,
    onSale: i % 2 === 0 ? "yes" : null,
  }));

  const result: ShoppingStrategyResult = {
    totalCost: mockItems.reduce(
      (sum, item) => sum + (item.salePrice ?? item.regularPrice),
      0
    ),
    totalTime: 20,
    storeCount: 1,
    stores: [{ store: mockStore, items: mockItems, subtotal: mockItems.reduce((sum, item) => sum + (item.salePrice ?? item.regularPrice), 0), }],
  };

  return {
    money: result,
    time: result,
    balanced: result,
  };
};

/**
 * Returns the total number of items in the strategy result.
 */
export const getItemCount = (result: ShoppingStrategyResult): number => {
  return result.stores.reduce((count, storeEntry) => count + storeEntry.items.length, 0);
};

/**
 * Groups store data with items and computes subtotal for each.
 */
export const getStoresWithItems = (
  result: ShoppingStrategyResult,
  allStores: Store[]
): StoreWithItems[] => {
  return result.stores.map(({ store, items }) => {
    const matchedStore = allStores.find((s) => s.name === store.name) || store;

    const subtotal = items.reduce(
      (sum, item) => sum + (item.salePrice ?? item.regularPrice),
      0
    );

    return {
      store: matchedStore,
      items,
      subtotal,
    };
  });
};
