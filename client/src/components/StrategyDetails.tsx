import React from "react";
import { Icon } from "./ui/icon";
import { Button } from "@/components/ui/button";
import { CalculateStrategiesResponse, StrategyType, Store } from "@/lib/types";
import { calculateSavings, formatCurrency, getStoresWithItems, getStrategyIcon, getStrategyLabel } from "@/lib/strategies";
import { cn } from "@/lib/utils";

interface StrategyDetailsProps {
  strategies: CalculateStrategiesResponse | null;
  activeStrategy: StrategyType;
  stores: Store[];
}

export default function StrategyDetails({
  strategies,
  activeStrategy,
  stores,
}: StrategyDetailsProps) {
  if (!strategies) return null;

  // Get the selected strategy
  const result = 
    activeStrategy === "money" 
      ? strategies.moneySaver
      : activeStrategy === "balanced"
        ? strategies.balancedSaver
        : strategies.timeSaver;
  
  const { strategy } = result;
  
  // Calculate savings
  const savings = calculateSavings(strategy.totalCost, strategy.regularCost);
  
  // Get stores with their items
  const storesWithItems = getStoresWithItems(result, stores);
  
  // Prepare the color class based on the active strategy
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
        <div className={cn("px-4 py-3 flex items-center justify-between", headerColorClass)}>
          <h2 className="text-white font-medium flex items-center">
            <Icon name={getStrategyIcon(activeStrategy)} className="mr-2" />
            {getStrategyLabel(activeStrategy)} Details
          </h2>
          <div className="bg-white text-primary rounded-full px-3 py-1 text-sm font-medium">
            Save {formatCurrency(savings.amount)} ({savings.percentage}%)
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {storesWithItems.map(({ store, items, subtotal }) => (
              <div className="flex-1" key={store.id}>
                <div className="p-3 bg-gray-50 rounded-lg mb-4">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Icon name="local_grocery_store" className="text-green-500 mr-2" />
                    Shop at {store.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Icon name="location_on" className="text-gray-500 mr-1 text-sm" />
                    <span>{store.distance} miles away ({store.travelTime} min)</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div 
                        key={item.productId} 
                        className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0 last:pb-0"
                      >
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">{item.productName}</span>
                            {item.onSale && (
                              <span className="ml-2 bg-green-500 text-white text-xs px-1.5 rounded">
                                {item.onSale}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-500 font-medium mr-2">
                            {formatCurrency(item.salePrice ?? item.regularPrice)}
                          </span>
                          {item.salePrice && (
                            <span className="text-xs line-through text-gray-500">
                              {formatCurrency(item.regularPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-medium">
                  Total Cost: <span className="text-green-500">{formatCurrency(strategy.totalCost)}</span>
                </h3>
                <p className="text-sm text-gray-600">
                  Without optimization: <span className="line-through">{formatCurrency(strategy.regularCost)}</span>
                </p>
              </div>
              <div>
                <h3 className="font-medium">
                  Total Time: <span className="text-orange-500">{strategy.totalTime} minutes</span>
                </h3>
                <p className="text-sm text-gray-600">
                  {storesWithItems.map(s => s.store.travelTime).join(" + ")}
                  {storesWithItems.length > 1 && ` + ${storesWithItems.length - 1} min between stores`}
                </p>
              </div>
              <Button className={cn(strategyColorClass, "whitespace-nowrap")}>
                <Icon name="directions" className="mr-1" />
                Get Directions
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Map Preview */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-100 px-4 py-3">
          <h2 className="font-medium">Trip Map</h2>
        </div>
        <div className="h-64 bg-gray-200 relative">
          {/* Placeholder for Map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Icon name="map" className="text-4xl text-gray-400" />
              <p className="text-gray-500 mt-2">Map view will display your optimized shopping route</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
