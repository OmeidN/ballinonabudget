// server/db/memory-storage.ts

import { IStorage } from "../storage";
import {
  User,
  InsertUser,
  GroceryItem,
  InsertGroceryItem,
  Store,
  Product,
  ShoppingStrategy,
  StrategyItem,
} from "../../shared/schema";

export class MemStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    return { id, email: "test@example.com", passwordHash: "hashed" };
  }
  async getUserByUsername(email: string): Promise<User | undefined> {
    return { id: 1, email, passwordHash: "hashed" };
  }
  async createUser(user: InsertUser): Promise<User> {
    return { id: 1, email: user.email, passwordHash: user.passwordHash };
  }

  async getGroceryItems(): Promise<GroceryItem[]> {
    return [];
  }
  async getGroceryItem(): Promise<GroceryItem | undefined> {
    return undefined;
  }
  async createGroceryItem(): Promise<GroceryItem> {
    return { id: 1, name: "test", userId: 1 };
  }
  async deleteGroceryItem(): Promise<boolean> {
    return true;
  }

  async getStores(): Promise<Store[]> {
    return [];
  }
  async getStore(): Promise<Store | undefined> {
    return undefined;
  }

  async getProducts(): Promise<Product[]> {
    return [];
  }
  async getProductsByName(): Promise<Product[]> {
    return [];
  }
  async searchProductsByName(): Promise<Product[]> {
    return [];
  }

  async calculateStrategies(): Promise<{
    moneySaver: { strategy: Omit<ShoppingStrategy, "id" | "userId">; items: { [storeId: number]: StrategyItem[] } };
    balancedSaver: { strategy: Omit<ShoppingStrategy, "id" | "userId">; items: { [storeId: number]: StrategyItem[] } };
    timeSaver: { strategy: Omit<ShoppingStrategy, "id" | "userId">; items: { [storeId: number]: StrategyItem[] } };
  }> {
    return {
      moneySaver: {
        strategy: {
          strategyType: "money",
          totalCost: 0,
          regularCost: 0,
          totalTime: 0,
          storeCount: 0,
        },
        items: {},
      },
      balancedSaver: {
        strategy: {
          strategyType: "balanced",
          totalCost: 0,
          regularCost: 0,
          totalTime: 0,
          storeCount: 0,
        },
        items: {},
      },
      timeSaver: {
        strategy: {
          strategyType: "time",
          totalCost: 0,
          regularCost: 0,
          totalTime: 0,
          storeCount: 0,
        },
        items: {},
      },
    };
  }
}
