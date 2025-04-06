import { apiRequest } from "./queryClient";
import {
  StrategyType,
  StoreWithItems,
  Store,
  StrategyItem,
  Coordinates,
} from "./types";

// ✅ Used by frontend display and backend response
export interface StrategyResultItem {
  name: string;
  storeId: string;
  price: number;
}

export interface CalculateStrategiesResponse {
  cheapest: StrategyResultItem[];
  balanced: StrategyResultItem[];
  oneStop: StrategyResultItem[];
}

// ✅ Updated to support location
export const calculateStrategies = async (
  groceryItems: string[],
  coords?: Coordinates | null
): Promise<CalculateStrategiesResponse> => {
  const response = await apiRequest("POST", "/api/calculate-strategies", {
    groceryItems,
    location: coords ?? null,
  });
  return response.json();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const calculateSavings = (
  totalCost: number,
  regularCost: number
): {
  amount: number;
  percentage: number;
} => {
  const savingsAmount = regularCost - totalCost;
  const savingsPercentage = (savingsAmount / regularCost) * 100;

  return {
    amount: savingsAmount,
    percentage: Math.round(savingsPercentage),
  };
};

export const getStrategyLabel = (type: StrategyType): string => {
  switch (type) {
    case "money":
      return "Money Saver";
    case "balanced":
      return "Balanced Saver";
    case "time":
      return "Time Saver";
    default:
      return "Unknown Strategy";
  }
};

export const getStrategyIcon = (type: StrategyType): string => {
  switch (type) {
    case "money":
      return "savings";
    case "balanced":
      return "balance";
    case "time":
      return "schedule";
    default:
      return "help_outline";
  }
};

export const getStrategyDescription = (type: StrategyType): string => {
  switch (type) {
    case "money":
      return "Lowest total cost";
    case "balanced":
      return "Best time/money balance";
    case "time":
      return "One-stop shopping";
    default:
      return "";
  }
};

export const getStoresWithItems = (
  result: {
    strategy: {
      totalCost: number;
      regularCost: number;
      totalTime: number;
      storeCount: number;
    };
    items: { [storeId: number]: StrategyItem[] };
  },
  allStores: Store[]
): StoreWithItems[] => {
  return Object.entries(result.items).map(([storeIdStr, items]) => {
    const storeId = parseInt(storeIdStr);
    const store = allStores.find((s) => s.id === storeId);

    if (!store) {
      throw new Error(`Store with ID ${storeId} not found`);
    }

    const subtotal = items.reduce(
      (sum, item) => sum + (item.salePrice ?? item.regularPrice),
      0
    );

    return {
      store,
      items,
      subtotal,
    };
  });
};
