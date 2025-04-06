export interface User {
  id: number;
  username: string;
}

export interface GroceryItem {
  id: number;
  name: string;
  userId: number;
}

export interface Store {
  id: number;
  name: string;
  distance: number;
  travelTime: number;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface Product {
  id: number;
  name: string;
  storeId: number;
  regularPrice: number;
  salePrice?: number;
  onSale?: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}


// ✅ NEW: Flat structure used by calculate-strategies
export interface StrategyResultItem {
  name: string;
  storeId: string;
  price: number;
}

// ✅ NEW: Matches backend response shape
export interface CalculateStrategiesResponse {
  cheapest: StrategyResultItem[];
  balanced: StrategyResultItem[];
  oneStop: StrategyResultItem[];
}

export type StrategyType = "money" | "balanced" | "time";

// Optional legacy types (still fine to keep around if needed)
export interface StrategyItem {
  productId: number;
  storeId: number;
  productName: string;
  storeName: string;
  regularPrice: number;
  salePrice?: number;
  onSale?: string;
}

export interface ShoppingStrategy {
  strategyType: "money" | "balanced" | "time";
  totalCost: number;
  regularCost: number;
  totalTime: number;
  storeCount: number;
}

export interface StrategyResult {
  strategy: ShoppingStrategy;
  items: { [storeId: number]: StrategyItem[] };
}

export interface StoreWithItems {
  store: Store;
  items: StrategyItem[];
  subtotal: number;
}
