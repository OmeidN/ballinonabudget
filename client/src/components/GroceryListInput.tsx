import React, { useState } from "react";
import { Icon } from "./ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { GroceryItem } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface GroceryListInputProps {
  groceryItems: GroceryItem[];
  isLoading: boolean;
  onCalculateStrategies: () => void;
}

export default function GroceryListInput({ 
  groceryItems, 
  isLoading,
  onCalculateStrategies 
}: GroceryListInputProps) {
  const [newItem, setNewItem] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState<number | null>(null);
  const { toast } = useToast();

  const handleAddItem = async () => {
    if (!newItem.trim()) {
      toast({
        title: "Please enter an item",
        description: "The item name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingItem(true);
      await apiRequest("POST", "/api/grocery-items", { name: newItem });
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-items"] });
      setNewItem("");
      toast({
        title: "Item added",
        description: `"${newItem}" has been added to your grocery list.`,
      });
    } catch (error) {
      toast({
        title: "Failed to add item",
        description: "There was an error adding the item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleRemoveItem = async (id: number) => {
    try {
      setIsDeletingItem(id);
      await apiRequest("DELETE", `/api/grocery-items/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-items"] });
      toast({
        title: "Item removed",
        description: "The item has been removed from your grocery list.",
      });
    } catch (error) {
      toast({
        title: "Failed to remove item",
        description: "There was an error removing the item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingItem(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  return (
    <section className="mb-8">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-medium mb-4">Your Grocery List</h2>
        
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex-grow">
            <div className="relative">
              <Input
                id="groceryItem"
                placeholder="Add an item (e.g., milk, eggs, bread)"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-10"
                disabled={isAddingItem}
              />
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary/80" 
                aria-label="Add item"
                onClick={handleAddItem}
                disabled={isAddingItem}
              >
                <Icon name="add_circle_outline" />
              </button>
            </div>
          </div>
          <Button 
            onClick={handleAddItem}
            disabled={isAddingItem}
            className="overflow-hidden"
          >
            {isAddingItem ? (
              <>
                <Icon name="hourglass_empty" className="mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>Add Item</>
            )}
          </Button>
        </div>
        
        <div>
          <div className="bg-gray-50 rounded-md p-1">
            {groceryItems.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Icon name="shopping_basket" className="mb-2 text-3xl" />
                <p>Your grocery list is empty</p>
                <p className="text-sm mt-1">Add items to start finding the best deals</p>
              </div>
            ) : (
              groceryItems.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between py-2 px-3 bg-white rounded-md mb-1 last:mb-0 border border-gray-200"
                >
                  <span>{item.name}</span>
                  <button 
                    className="text-red-500" 
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isDeletingItem === item.id}
                    aria-label="Remove item"
                  >
                    {isDeletingItem === item.id ? (
                      <Icon name="hourglass_empty" className="animate-spin" />
                    ) : (
                      <Icon name="close" />
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Button 
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 shadow-md flex items-center mx-auto font-medium animate-pulse"
          onClick={onCalculateStrategies}
          disabled={isLoading || groceryItems.length === 0}
          size="lg"
        >
          <Icon name="search" className="mr-2" />
          {isLoading ? 'Finding Deals...' : 'Find the Best Deals'}
        </Button>
        <p className="text-sm text-gray-500 mt-2">We'll check prices at nearby stores</p>
      </div>
    </section>
  );
}
