import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";
import GroceryListInput from "@/components/GroceryListInput";
import StrategySwitcher from "@/components/StrategySwitcher";
import StrategyDetails from "@/components/StrategyDetails";
import BottomNavigation from "@/components/BottomNavigation";
import { calculateStrategies } from "@/lib/strategies";
import {
  CalculateStrategiesResponse,
  GroceryItem,
  StrategyType,
  Store,
} from "@/lib/types";

export default function Home() {
  const [activeStrategy, setActiveStrategy] = useState<StrategyType>("balanced");
  const [strategies, setStrategies] = useState<CalculateStrategiesResponse | null>(null);
  const { toast } = useToast();

  // ✅ Fetch grocery items
  const {
    data: groceryItems = [],
    isLoading: isLoadingItems,
    error: itemsError,
  } = useQuery<GroceryItem[]>({
    queryKey: ["/api/grocery-items"],
    queryFn: async () => {
      const res = await fetch("/api/grocery-items");
      if (!res.ok) throw new Error("Failed to fetch grocery items");
      return res.json();
    },
  });

  // ✅ Fetch stores
  const {
    data: stores = [],
    isLoading: isLoadingStores,
    error: storesError,
  } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
    queryFn: async () => {
      const res = await fetch("/api/stores");
      if (!res.ok) throw new Error("Failed to fetch stores");
      return res.json();
    },
  });

  // Mutation for calculating strategies
  const {
    mutate: calculateStrategiesMutation,
    isPending: isCalculating,
  } = useMutation({
    mutationFn: async () => {
      const itemNames = groceryItems.map((item: GroceryItem) => item.name);
      return calculateStrategies(itemNames);
    },
    onSuccess: (data) => {
      setStrategies(data);
      toast({
        title: "Strategies calculated",
        description: "We found the best shopping options for your list.",
      });
    },
    onError: () => {
      toast({
        title: "Calculation failed",
        description: "We couldn't calculate strategies. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCalculateStrategies = () => {
    if (groceryItems.length === 0) {
      toast({
        title: "Empty grocery list",
        description: "Please add at least one item to your grocery list.",
        variant: "destructive",
      });
      return;
    }

    calculateStrategiesMutation();
  };

  const handleStrategyChange = (type: StrategyType) => {
    setActiveStrategy(type);
  };

  // Global error toast
  if (itemsError || storesError) {
    toast({
      title: "Error loading data",
      description: "There was an error loading the application data.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-6">
      <AppHeader notificationCount={3} />

      <main className="container mx-auto px-4 py-6">
        <GroceryListInput
          groceryItems={groceryItems}
          isLoading={isCalculating}
          onCalculateStrategies={handleCalculateStrategies}
        />

        {strategies && (
          <>
            <StrategySwitcher
              strategies={strategies}
              activeStrategy={activeStrategy}
              onStrategyChange={handleStrategyChange}
            />

            <StrategyDetails
              strategies={strategies}
              activeStrategy={activeStrategy}
              stores={stores}
            />
          </>
        )}
      </main>

      <BottomNavigation activeTab="home" />
    </div>
  );
}
