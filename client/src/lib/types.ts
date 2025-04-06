export type StrategyType = "money" | "balanced" | "time";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Store {
  id: number;
  name: string;
  distance: number;
  travelTime: number;
  address: string | null;
  lat: number | null;
  lng: number | null;
}

export interface GroceryItem {
  id: number;
  name: string;
  userId: number;
}

export interface Product {
  id: number;
  name: string;
  storeId: number;
  regularPrice: number;
  salePrice?: number | null;
  onSale?: string | null;
  brand?: string;
  size?: string;
  lastUpdated?: string;
}

export interface StrategyItem {
  productId: number;
  storeId: number | string;
  productName: string;
  storeName: string;
  regularPrice: number;
  salePrice: number | null;
  onSale: string | null;
}

export interface ShoppingStrategyResult {
  strategy: {
    strategyType: StrategyType;
    totalCost: number;
    regularCost: number;
    totalTime: number;
    storeCount: number;
  };
  items: {
    [storeId: number]: StrategyItem[];
  };
}

export interface CalculateStrategiesRequest {
  groceryItems: string[];
  location: Coordinates | null;
}

export interface CalculateStrategiesResponse {
  moneySaver: ShoppingStrategyResult;
  balancedSaver: ShoppingStrategyResult;
  timeSaver: ShoppingStrategyResult;
}

export interface StoreWithItems {
  store: Store;
  items: StrategyItem[];
  subtotal: number;
}
