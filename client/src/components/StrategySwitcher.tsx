import React from "react";
import { Icon } from "./ui/icon";
import { Badge } from "./ui/badge";
import { CalculateStrategiesResponse, StrategyType } from "@/lib/types";
import { calculateSavings, formatCurrency, getStrategyDescription, getStrategyIcon, getStrategyLabel } from "@/lib/strategies";
import { cn } from "@/lib/utils";

interface StrategySwitcherProps {
  strategies: CalculateStrategiesResponse | null;
  activeStrategy: StrategyType;
  onStrategyChange: (type: StrategyType) => void;
}

export default function StrategySwitcher({
  strategies,
  activeStrategy,
  onStrategyChange
}: StrategySwitcherProps) {
  if (!strategies) return null;

  const { moneySaver, balancedSaver, timeSaver } = strategies;

  // For each strategy, calculate savings
  const moneySavings = calculateSavings(moneySaver.strategy.totalCost, moneySaver.strategy.regularCost);
  const balancedSavings = calculateSavings(balancedSaver.strategy.totalCost, balancedSaver.strategy.regularCost);
  
  return (
    <section className="mb-8">
      <h2 className="text-xl font-medium mb-4">Shopping Strategies</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Money Saver Strategy */}
        <div 
          className={cn(
            "bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 cursor-pointer border-2",
            activeStrategy === "money" 
              ? "border-green-500" 
              : "border-transparent"
          )}
          onClick={() => onStrategyChange("money")}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">{getStrategyLabel("money")}</h3>
            <Badge variant="money">
              SAVE {formatCurrency(moneySavings.amount)}
            </Badge>
          </div>
          <div className="mb-2">
            <div className="flex items-center">
              <Icon name={getStrategyIcon("money")} className="text-green-500 mr-1" />
              <span className="text-sm">{getStrategyDescription("money")}</span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Icon name="store" className="text-gray-500 mr-1 text-sm" />
            <span>Visit {moneySaver.strategy.storeCount} stores</span>
            <span className="mx-2">•</span>
            <Icon name="directions_car" className="text-gray-500 mr-1 text-sm" />
            <span>{moneySaver.strategy.totalTime} min total</span>
          </div>
        </div>
        
        {/* Balanced Saver Strategy */}
        <div 
          className={cn(
            "bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 cursor-pointer border-2",
            activeStrategy === "balanced" 
              ? "border-blue-500" 
              : "border-transparent"
          )}
          onClick={() => onStrategyChange("balanced")}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">{getStrategyLabel("balanced")}</h3>
            <Badge variant="balanced">
              SAVE {formatCurrency(balancedSavings.amount)}
            </Badge>
          </div>
          <div className="mb-2">
            <div className="flex items-center">
              <Icon name={getStrategyIcon("balanced")} className="text-blue-500 mr-1" />
              <span className="text-sm">{getStrategyDescription("balanced")}</span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Icon name="store" className="text-gray-500 mr-1 text-sm" />
            <span>Visit {balancedSaver.strategy.storeCount} stores</span>
            <span className="mx-2">•</span>
            <Icon name="directions_car" className="text-gray-500 mr-1 text-sm" />
            <span>{balancedSaver.strategy.totalTime} min total</span>
          </div>
        </div>
        
        {/* Time Saver Strategy */}
        <div 
          className={cn(
            "bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 cursor-pointer border-2",
            activeStrategy === "time" 
              ? "border-orange-500" 
              : "border-transparent"
          )}
          onClick={() => onStrategyChange("time")}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">{getStrategyLabel("time")}</h3>
            <Badge variant="time">SAVE TIME</Badge>
          </div>
          <div className="mb-2">
            <div className="flex items-center">
              <Icon name={getStrategyIcon("time")} className="text-orange-500 mr-1" />
              <span className="text-sm">{getStrategyDescription("time")}</span>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Icon name="store" className="text-gray-500 mr-1 text-sm" />
            <span>Visit {timeSaver.strategy.storeCount} store</span>
            <span className="mx-2">•</span>
            <Icon name="directions_car" className="text-gray-500 mr-1 text-sm" />
            <span>{timeSaver.strategy.totalTime} min total</span>
          </div>
        </div>
      </div>
    </section>
  );
}
