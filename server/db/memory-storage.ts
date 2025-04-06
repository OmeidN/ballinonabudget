import {
    User,
    InsertUser,
    GroceryItem,
    InsertGroceryItem,
    Store,
    Product,
    StrategyItem,
    CalculateStrategiesRequest,
    CalculateStrategiesResponse,
    SaveStrategyRequest,
    SavedStrategyResponse,
  } from "../../shared/schema";
  import { IStorage } from "../types";
  
  let userIdCounter = 1;
  let groceryIdCounter = 1;
  let strategyIdCounter = 1;
  let productIdCounter = 1;
  
  export class MemStorage implements IStorage {
    private users: User[] = [];
    private groceryItems: GroceryItem[] = [];
    private stores: Store[] = [];
    private products: Product[] = [];
    private strategies: SavedStrategyResponse[] = [];
  
    async getUser(id: number): Promise<User | undefined> {
      return this.users.find(u => u.id === id);
    }
  
    async getUserByUsername(email: string): Promise<User | undefined> {
      return this.users.find(u => u.email === email);
    }
  
    async createUser(user: InsertUser): Promise<User> {
      const newUser = { id: userIdCounter++, ...user };
      this.users.push(newUser);
      return newUser;
    }
  
    async getGroceryItems(userId: number): Promise<GroceryItem[]> {
      return this.groceryItems.filter(item => item.userId === userId);
    }
  
    async getGroceryItem(id: number): Promise<GroceryItem | undefined> {
      return this.groceryItems.find(item => item.id === id);
    }
  
    async createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem> {
      const newItem = { id: groceryIdCounter++, ...item };
      this.groceryItems.push(newItem);
      return newItem;
    }
  
    async deleteGroceryItem(id: number): Promise<boolean> {
      const index = this.groceryItems.findIndex(item => item.id === id);
      if (index !== -1) {
        this.groceryItems.splice(index, 1);
        return true;
      }
      return false;
    }
  
    async getStores(): Promise<Store[]> {
      return this.stores;
    }
  
    async getStore(id: number): Promise<Store | undefined> {
      return this.stores.find(store => store.id === id);
    }
  
    async getProducts(storeId?: number): Promise<Product[]> {
      if (storeId) {
        return this.products.filter(p => p.storeId === storeId);
      }
      return this.products;
    }
  
    async getProductsByName(name: string): Promise<Product[]> {
      return this.products.filter(p =>
        p.name.toLowerCase().includes(name.toLowerCase())
      );
    }
  
    async searchProductsByName(query: string): Promise<Product[]> {
      return this.products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  
    async calculateStrategies(
      request: CalculateStrategiesRequest
    ): Promise<CalculateStrategiesResponse> {
      const { groceryItems, userId } = request;
  
      return {
        moneySaver: {
          strategy: {
            strategyType: "money",
            totalCost: 100,
            regularCost: 120,
            totalTime: 30,
            storeCount: 2,
          },
          items: {},
        },
        balancedSaver: {
          strategy: {
            strategyType: "balanced",
            totalCost: 110,
            regularCost: 120,
            totalTime: 25,
            storeCount: 1,
          },
          items: {},
        },
        timeSaver: {
          strategy: {
            strategyType: "time",
            totalCost: 115,
            regularCost: 120,
            totalTime: 20,
            storeCount: 1,
          },
          items: {},
        },
      };
    }
  
    async saveStrategy(data: SaveStrategyRequest): Promise<SavedStrategyResponse> {
      const { userId, strategyType, items } = data;
  
      const totalCost = items.reduce((sum, item) => sum + (item.salePrice ?? item.regularPrice), 0);
      const regularCost = items.reduce((sum, item) => sum + item.regularPrice, 0);
      const storeCount = new Set(items.map(i => i.storeId)).size;
      const totalTime = storeCount * 10;
  
      const saved: SavedStrategyResponse = {
        id: strategyIdCounter++,
        userId,
        strategyType,
        totalCost,
        regularCost,
        totalTime,
        storeCount,
      };
  
      this.strategies.push(saved);
      return saved;
    }
  }
  