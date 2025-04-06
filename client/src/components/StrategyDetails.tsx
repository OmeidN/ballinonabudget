// client/src/components/StrategyDetails.tsx
import { ShoppingStrategyResult } from "@/lib/types";

interface StrategyDetailsProps {
  strategy: ShoppingStrategyResult;
}

export default function StrategyDetails({ strategy }: StrategyDetailsProps) {
  return (
    <div className="border rounded p-4 shadow">
      <h2 className="text-xl font-semibold mb-2">Strategy Details</h2>
      <p>Total Cost: ${strategy.totalCost.toFixed(2)}</p>
      <p>Total Time: {strategy.totalTime} mins</p>
      <p>Store Count: {strategy.storeCount}</p>

      <div className="mt-4">
        <h3 className="font-semibold">Items:</h3>
        <ul className="list-disc ml-5">
          {strategy.stores.map((storeData, index) => (
            <li key={index}>
              <strong>{storeData.store.name}:</strong>{" "}
              {storeData.items.map((item) => item.productName).join(", ")}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
