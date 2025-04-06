// client/src/components/GroceryListInput.tsx
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export interface GroceryListInputProps {
  list: string[];
  setList: React.Dispatch<React.SetStateAction<string[]>>;
  onGenerate: () => Promise<void>;
  loading: boolean;
}

export default function GroceryListInput({
  list,
  setList,
  onGenerate,
  loading,
}: GroceryListInputProps) {
  const [input, setInput] = useState("");

  const addItem = () => {
    const trimmed = input.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setInput("");
    }
  };

  const removeItem = (item: string) => {
    setList(list.filter((i) => i !== item));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") addItem();
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Input
          placeholder="Add a grocery item..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={addItem} disabled={loading}>
          Add
        </Button>
      </div>

      {list.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-3">
          {list.map((item) => (
            <li
              key={item}
              className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {item}
              <button
                className="ml-1 text-gray-500 hover:text-red-500"
                onClick={() => removeItem(item)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <Button
        onClick={onGenerate}
        disabled={list.length === 0 || loading}
        className={cn("w-full", { "opacity-50": loading })}
      >
        {loading ? "Loading..." : "Generate Strategies"}
      </Button>
    </div>
  );
}
