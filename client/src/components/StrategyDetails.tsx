import React from "react";
import { Icon } from "./ui/icon";
import { Button } from "@/components/ui/button";
import {
  CalculateStrategiesResponse,
  Coordinates,
  StrategyType,
  Store,
} from "@/lib/types";
import {
  formatCurrency,
  getStrategyIcon,
  getStrategyLabel,
  getStrategyDescription,
} from "@/lib/strategies";
import { cn } from "@/lib/utils";
import RouteMap from "./RouteMap"; // ✅ Import the working map

interface StrategyItem {
  name: string;
  storeId: string;
  price: number;
}

interface StrategyDetailsProps {
  strategies: CalculateStrategiesResponse | null;
  activeStrategy: StrategyType;
  stores: Store[];
  coords?: Coordinates | null; // ✅ Accept user location
}

export default function StrategyDetails({
  strategies,
  activeStrategy,
  stores,
  coords,
}: StrategyDetailsProps) {
  if (!strategies) return null;

  const items: StrategyItem[] =
    activeStrategy === "money"
      ? strategies.cheapest
      : activeStrategy === "time"
      ? strategies.oneStop
      : strategies.balanced;

  const total = items.reduce((sum, item) => sum + item.price, 0);

  const grouped = items.reduce<Record<string, StrategyItem[]>>((acc, item) => {
    if (!acc[item.storeId]) acc[item.storeId] = [];
    acc[item.storeId].push(item);
    return acc;
  }, {});

  const selectedStores: Store[] = Object.keys(grouped)
    .map((storeId) => stores.find((s) => s.id.toString() === storeId))
    .filter(Boolean) as Store[];

  const strategyColorClass =
    activeStrategy === "money"
      ? "bg-green-500"
      : activeStrategy === "balanced"
      ? "bg-blue-500"
      : "bg-orange-500";

  const headerColorClass =
    activeStrategy === "money"
      ? "bg-green-500 text-white"
      : activeStrategy === "balanced"
      ? "bg-blue-500 text-white"
      : "bg-orange-500 text-white";

  return (
    <section>
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div
          className={cn(
            "px-4 py-3 flex items-center justify-between",
            headerColorClass
          )}
        >
          <h2 className="text-white font-medium flex items-center">
            <Icon name={getStrategyIcon(activeStrategy)} className="mr-2" />
            {getStrategyLabel(activeStrategy)} Details
          </h2>
          <div className="bg-white text-primary rounded-full px-3 py-1 text-sm font-medium">
            {getStrategyDescription(activeStrategy)}
          </div>
        </div>

        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {Object.entries(grouped).map(([storeId, storeItems]) => {
              const store = stores.find((s) => s.id.toString() === storeId);
              const subtotal = storeItems.reduce((sum, i) => sum + i.price, 0);

              return (
                <div className="flex-1" key={storeId}>
                  <div className="p-3 bg-gray-50 rounded-lg mb-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Icon
                        name="local_grocery_store"
                        className="text-green-500 mr-2"
                      />
                      Shop at {store?.name ?? `Store ${storeId}`}
                    </h3>
                    <div className="space-y-2 text-sm">
                      {storeItems.map((item) => (
                        <div
                          key={item.name}
                          className="flex justify-between border-b pb-2 last:border-none"
                        >
                          <span>{item.name}</span>
                          <span>{formatCurrency(item.price)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-sm font-medium">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-medium">
                Total Cost:{" "}
                <span className="text-green-500">
                  {formatCurrency(total)}
                </span>
              </h3>
            </div>
            <Button className={cn(strategyColorClass, "whitespace-nowrap")}>
              <Icon name="directions" className="mr-1" />
              Get Directions
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ Live Route Map */}
      {coords && selectedStores.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-100 px-4 py-3">
            <h2 className="font-medium">Shopping Route</h2>
          </div>
          <div className="h-64">
            <RouteMap origin={coords} stores={selectedStores} />
          </div>
        </div>
      )}
    </section>
  );
}
