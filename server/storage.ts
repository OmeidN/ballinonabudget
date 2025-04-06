// server/storage.ts

import {
  users, type User, type InsertUser,
  groceryItems, type GroceryItem, type InsertGroceryItem,
  stores, type Store, type InsertStore,
  products, type Product, type InsertProduct,
  shoppingStrategies, type ShoppingStrategy, type InsertShoppingStrategy,
  type StrategyItem
} from "../shared/schema";

import { MemStorage } from "./db/memory-storage";
import { mongoStorage } from "./db/mongo-storage"; // ✅ use the exported constant

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getGroceryItems(userId: number): Promise<GroceryItem[]>;
  getGroceryItem(id: number): Promise<GroceryItem | undefined>;
  createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem>;
  deleteGroceryItem(id: number): Promise<boolean>;

  getStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;

  getProducts(storeId: number): Promise<Product[]>;
  getProductsByName(name: string): Promise<Product[]>;
  searchProductsByName(query: string): Promise<Product[]>;

  calculateStrategies(groceryItems: string[]): Promise<{
    moneySaver: {
      strategy: Omit<ShoppingStrategy, "id" | "userId">;
      items: { [storeId: number]: StrategyItem[] };
    };
    balancedSaver: {
      strategy: Omit<ShoppingStrategy, "id" | "userId">;
      items: { [storeId: number]: StrategyItem[] };
    };
    timeSaver: {
      strategy: Omit<ShoppingStrategy, "id" | "userId">;
      items: { [storeId: number]: StrategyItem[] };
    };
  }>;
}

// ✅ Decide storage engine
const useMongo = !!process.env.MONGODB_URI;

export const storage: IStorage = useMongo
  ? mongoStorage
  : new MemStorage();
