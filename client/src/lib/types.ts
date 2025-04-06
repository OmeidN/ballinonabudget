export interface StrategyItem {
  productId: number;
  productName: string;
  storeId: string | number;
  storeName: string;
  regularPrice: number;
  salePrice: number | null;
  onSale: string | null;
}

export interface Store {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
  travelTime: number;
}

export interface StoreWithItems {
  store: Store;
  items: StrategyItem[];
  subtotal: number;
}

export interface ShoppingStrategyResult {
  totalCost: number;
  totalTime: number;
  storeCount: number;
  stores: StoreWithItems[];
}

export interface CalculateStrategiesResponse {
  money: ShoppingStrategyResult;
  time: ShoppingStrategyResult;
  balanced: ShoppingStrategyResult;
}

export type StrategyType = keyof CalculateStrategiesResponse;

export type Coordinates = {
  lat: number;
  lng: number;
};

