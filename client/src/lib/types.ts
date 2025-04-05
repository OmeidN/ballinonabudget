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

export interface CalculateStrategiesResponse {
  moneySaver: StrategyResult;
  balancedSaver: StrategyResult;
  timeSaver: StrategyResult;
}

export type StrategyType = "money" | "balanced" | "time";

export interface StoreWithItems {
  store: Store;
  items: StrategyItem[];
  subtotal: number;
}
