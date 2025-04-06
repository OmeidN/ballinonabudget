// client/src/pages/Home.tsx
import { useState } from "react";
import { calculateStrategies } from "@/lib/strategies";
import { StrategyType, CalculateStrategiesResponse } from "@/lib/types";

import GroceryListInput from "@/components/GroceryListInput";
import StrategySwitcher from "@/components/StrategySwitcher";
import StrategyDetails from "@/components/StrategyDetails";

export default function Home() {
  const [list, setList] = useState<string[]>([]);
  const [activeStrategy, setActiveStrategy] = useState<StrategyType>("money");
  const [strategies, setStrategies] = useState<CalculateStrategiesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateStrategies = async () => {
    if (list.length === 0) return;
    setLoading(true);
    try {
      const result = await calculateStrategies(list);
      setStrategies(result);
    } catch (error) {
      console.error("Error generating strategies:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Smart Shopper</h1>

      <GroceryListInput
        list={list}
        setList={setList}
        onGenerate={handleGenerateStrategies}
        loading={loading}
      />

      {strategies && (
        <>
          <StrategySwitcher
            activeStrategy={activeStrategy}
            onChange={setActiveStrategy}
          />

          <StrategyDetails
            strategy={strategies[activeStrategy as keyof CalculateStrategiesResponse]}
          />
        </>
      )}
    </main>
  );
}
