import { apiRequest } from "./queryClient";
import { CalculateStrategiesResponse, StrategyType, StoreWithItems, Store, StrategyItem } from "./types";

export const calculateStrategies = async (
  groceryItems: string[]
): Promise<CalculateStrategiesResponse> => {
  const response = await apiRequest("POST", "/api/calculate-strategies", {
    groceryItems,
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
  // Convert items object to array of StoreWithItems
  return Object.entries(result.items).map(([storeIdStr, items]) => {
    const storeId = parseInt(storeIdStr);
    const store = allStores.find((s) => s.id === storeId);
    
    if (!store) {
      throw new Error(`Store with ID ${storeId} not found`);
    }
    
    // Calculate subtotal for this store
    const subtotal = items.reduce(
      (sum, item) => sum + (item.salePrice ?? item.regularPrice),
      0
    );
    
    return {
      store,
      items,
      subtotal
    };
  });
};
