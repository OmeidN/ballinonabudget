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
  } from "../shared/schema";
  
  // Interface used to enforce structure for all storage backends
  export interface IStorage {
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(email: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
  
    getGroceryItems(userId: number): Promise<GroceryItem[]>;
    getGroceryItem(id: number): Promise<GroceryItem | undefined>;
    createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem>;
    deleteGroceryItem(id: number): Promise<boolean>;
  
    getStores(): Promise<Store[]>;
    getStore(id: number): Promise<Store | undefined>;
  
    getProducts(storeId?: number): Promise<Product[]>;
    getProductsByName(name: string): Promise<Product[]>;
    searchProductsByName(query: string): Promise<Product[]>;
  
    calculateStrategies(request: CalculateStrategiesRequest): Promise<CalculateStrategiesResponse>;
    saveStrategy(data: SaveStrategyRequest): Promise<SavedStrategyResponse>;
  }
  