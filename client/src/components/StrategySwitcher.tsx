// client/src/components/StrategySwitcher.tsx
import { StrategyType } from "@/lib/types";

interface StrategySwitcherProps {
  activeStrategy: StrategyType;
  onChange: (type: StrategyType) => void;
}

export default function StrategySwitcher({ activeStrategy, onChange }: StrategySwitcherProps) {
  const strategies: StrategyType[] = ["money", "time", "balanced"];

  return (
    <div className="flex space-x-4 mb-4">
      {strategies.map((strategy) => (
        <button
          key={strategy}
          onClick={() => onChange(strategy)}
          className={`px-4 py-2 rounded ${
            activeStrategy === strategy ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          {strategy.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
