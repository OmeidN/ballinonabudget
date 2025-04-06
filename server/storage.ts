import { 
  users, type User, type InsertUser,
  groceryItems, type GroceryItem, type InsertGroceryItem,
  stores, type Store, type InsertStore,
  products, type Product, type InsertProduct,
  shoppingStrategies, type ShoppingStrategy, type InsertShoppingStrategy,
  type StrategyItem
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Grocery item operations
  getGroceryItems(userId: number): Promise<GroceryItem[]>;
  getGroceryItem(id: number): Promise<GroceryItem | undefined>;
  createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem>;
  deleteGroceryItem(id: number): Promise<boolean>;
  
  // Store operations
  getStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  
  // Product operations
  getProducts(storeId: number): Promise<Product[]>;
  getProductsByName(name: string): Promise<Product[]>;
  searchProductsByName(query: string): Promise<Product[]>;

  // Strategy operations
  calculateStrategies(groceryItems: string[]): Promise<{
    moneySaver: {
      strategy: Omit<ShoppingStrategy, "id" | "userId">,
      items: { [storeId: number]: StrategyItem[] }
    },
    balancedSaver: {
      strategy: Omit<ShoppingStrategy, "id" | "userId">,
      items: { [storeId: number]: StrategyItem[] }
    },
    timeSaver: {
      strategy: Omit<ShoppingStrategy, "id" | "userId">,
      items: { [storeId: number]: StrategyItem[] }
    }
  }>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private groceryItems: Map<number, GroceryItem>;
  private stores: Map<number, Store>;
  private products: Map<number, Product>;
  private shoppingStrategies: Map<number, ShoppingStrategy>;
  
  private userIdCounter: number;
  private groceryItemIdCounter: number;
  private storeIdCounter: number;
  private productIdCounter: number;
  private strategyIdCounter: number;

  constructor() {
    this.users = new Map();
    this.groceryItems = new Map();
    this.stores = new Map();
    this.products = new Map();
    this.shoppingStrategies = new Map();
    
    this.userIdCounter = 1;
    this.groceryItemIdCounter = 1;
    this.storeIdCounter = 1;
    this.productIdCounter = 1;
    this.strategyIdCounter = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample stores
    const stores: InsertStore[] = [
      { name: "Trader Joe's", distance: 2.3, travelTime: 8, address: "123 Main St", lat: 33.749, lng: -84.388 },
      { name: "Kroger", distance: 1.7, travelTime: 6, address: "456 Oak Ave", lat: 33.755, lng: -84.39 },
      { name: "Walmart", distance: 3.5, travelTime: 12, address: "789 Pine Blvd", lat: 33.76, lng: -84.4 },
      { name: "Publix", distance: 2.1, travelTime: 7, address: "321 Elm St", lat: 33.748, lng: -84.395 },
    ];
    
    stores.forEach(store => {
      const id = this.storeIdCounter++;
      // Ensure all required properties have non-undefined values
      this.stores.set(id, { 
        ...store, 
        id,
        address: store.address || null,
        lat: store.lat || null,
        lng: store.lng || null
      });
    });

    // Create sample products
    const productData = [
      { name: "1% Milk (1 gallon)", regularPrice: 3.99, salePrice: 3.49, storeIds: [1, 2, 3, 4] },
      { name: "Eggs (dozen, large)", regularPrice: 4.99, salePrice: 2.49, storeIds: [1, 2, 3, 4], onSale: "BOGO" },
      { name: "Whole Wheat Bread", regularPrice: 3.49, salePrice: 2.99, storeIds: [1, 2, 3, 4] },
      { name: "Bananas (bunch)", regularPrice: 2.19, salePrice: 1.79, storeIds: [1, 2, 3, 4] },
      { name: "Ground Beef (1 lb)", regularPrice: 5.79, salePrice: 4.99, storeIds: [1, 2, 3, 4] },
    ];
    
    // Create products with price variations for each store
    productData.forEach(product => {
      product.storeIds.forEach(storeId => {
        // Add some price variation between stores
        const variation = (storeId % 3) * 0.1;
        const regularPrice = parseFloat((product.regularPrice + variation).toFixed(2));
        // Calculate salePrice or set to null if not available
        const salePrice = product.salePrice ? parseFloat((product.salePrice + variation).toFixed(2)) : null;
        
        const id = this.productIdCounter++;
        this.products.set(id, {
          id,
          name: product.name,
          storeId,
          regularPrice,
          salePrice: salePrice || null,
          onSale: product.onSale || null
        });
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Grocery item methods
  async getGroceryItems(userId: number): Promise<GroceryItem[]> {
    return Array.from(this.groceryItems.values()).filter(
      (item) => item.userId === userId
    );
  }

  async getGroceryItem(id: number): Promise<GroceryItem | undefined> {
    return this.groceryItems.get(id);
  }

  async createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem> {
    const id = this.groceryItemIdCounter++;
    const groceryItem = { ...item, id };
    this.groceryItems.set(id, groceryItem);
    return groceryItem;
  }

  async deleteGroceryItem(id: number): Promise<boolean> {
    return this.groceryItems.delete(id);
  }

  // Store methods
  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  // Product methods
  async getProducts(storeId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.storeId === storeId
    );
  }

  async getProductsByName(name: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  async searchProductsByName(query: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.name.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  // Strategy calculation method
  async calculateStrategies(groceryItemNames: string[]): Promise<{
    moneySaver: {
      strategy: Omit<ShoppingStrategy, "id" | "userId">,
      items: { [storeId: number]: StrategyItem[] }
    },
    balancedSaver: {
      strategy: Omit<ShoppingStrategy, "id" | "userId">,
      items: { [storeId: number]: StrategyItem[] }
    },
    timeSaver: {
      strategy: Omit<ShoppingStrategy, "id" | "userId">,
      items: { [storeId: number]: StrategyItem[] }
    }
  }> {
    // Get all stores
    const allStores = await this.getStores();
    
    // Initialize strategy results
    const moneySaverItems: { [storeId: number]: StrategyItem[] } = {};
    const balancedSaverItems: { [storeId: number]: StrategyItem[] } = {};
    const timeSaverItems: { [storeId: number]: StrategyItem[] } = {};
    
    // Calculate best prices for each item
    const itemPricesByStore: {
      [itemName: string]: {
        bestPrice: {
          product: Product,
          store: Store
        },
        pricesByStore: {
          [storeId: number]: {
            product: Product,
            store: Store
          }
        }
      }
    } = {};
    
    // Find best prices for each grocery item
    for (const itemName of groceryItemNames) {
      const matchingProducts = await this.getProductsByName(itemName);
      
      if (matchingProducts.length === 0) continue;
      
      let bestPrice = Infinity;
      let bestProduct: Product | null = null;
      let bestStore: Store | null = null;
      
      const pricesByStore: {
        [storeId: number]: {
          product: Product,
          store: Store
        }
      } = {};
      
      for (const product of matchingProducts) {
        const store = allStores.find(s => s.id === product.storeId);
        if (!store) continue;
        
        const price = product.salePrice ?? product.regularPrice;
        
        pricesByStore[store.id] = {
          product,
          store
        };
        
        if (price < bestPrice) {
          bestPrice = price;
          bestProduct = product;
          bestStore = store;
        }
      }
      
      if (bestProduct && bestStore) {
        itemPricesByStore[itemName] = {
          bestPrice: {
            product: bestProduct,
            store: bestStore
          },
          pricesByStore
        };
      }
    }
    
    // Money Saver Strategy - Choose the cheapest store for each item
    let moneySaverTotalCost = 0;
    let moneySaverRegularCost = 0;
    let moneySaverTotalTime = 0;
    const visitedStores = new Set<number>();
    
    for (const itemName in itemPricesByStore) {
      const { bestPrice } = itemPricesByStore[itemName];
      const { product, store } = bestPrice;
      
      if (!moneySaverItems[store.id]) {
        moneySaverItems[store.id] = [];
        if (!visitedStores.has(store.id)) {
          visitedStores.add(store.id);
          moneySaverTotalTime += store.travelTime;
        }
      }
      
      moneySaverItems[store.id].push({
        productId: product.id,
        storeId: store.id,
        productName: product.name,
        storeName: store.name,
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        onSale: product.onSale
      });
      
      moneySaverTotalCost += product.salePrice ?? product.regularPrice;
      moneySaverRegularCost += product.regularPrice;
    }
    
    // Add transit time between stores (1 minute per transition)
    moneySaverTotalTime += Math.max(0, visitedStores.size - 1);
    
    // Balanced Saver Strategy - Use at most 2-3 stores with best overall value
    // For simplicity, we'll select the 2 stores with the most items at best prices
    const storeItemCounts: { [storeId: number]: number } = {};
    const storeItemSavings: { [storeId: number]: number } = {};
    
    // Count how many items have their best price at each store
    for (const itemName in itemPricesByStore) {
      const { bestPrice } = itemPricesByStore[itemName];
      const storeId = bestPrice.store.id;
      storeItemCounts[storeId] = (storeItemCounts[storeId] || 0) + 1;
      
      // Calculate savings at each store
      const saving = bestPrice.product.regularPrice - (bestPrice.product.salePrice ?? bestPrice.product.regularPrice);
      storeItemSavings[storeId] = (storeItemSavings[storeId] || 0) + saving;
    }
    
    // Select top 2 stores by item count and savings
    const storeRankings = Object.keys(storeItemCounts).map(id => ({
      id: parseInt(id),
      count: storeItemCounts[parseInt(id)],
      savings: storeItemSavings[parseInt(id)]
    }));
    
    storeRankings.sort((a, b) => {
      // First by count
      if (b.count !== a.count) return b.count - a.count;
      // Then by savings
      return b.savings - a.savings;
    });
    
    const balancedStoreIds = storeRankings.slice(0, 2).map(s => s.id);
    
    // Assign each item to one of the balanced stores
    let balancedSaverTotalCost = 0;
    let balancedSaverRegularCost = 0;
    let balancedSaverTotalTime = 0;
    const balancedVisitedStores = new Set<number>();
    
    for (const itemName in itemPricesByStore) {
      const { pricesByStore } = itemPricesByStore[itemName];
      
      // Find the best store among the balanced ones
      let bestBalancedPrice = Infinity;
      let bestBalancedProduct: Product | null = null;
      let bestBalancedStore: Store | null = null;
      
      for (const storeId of balancedStoreIds) {
        if (pricesByStore[storeId]) {
          const { product, store } = pricesByStore[storeId];
          const price = product.salePrice ?? product.regularPrice;
          
          if (price < bestBalancedPrice) {
            bestBalancedPrice = price;
            bestBalancedProduct = product;
            bestBalancedStore = store;
          }
        }
      }
      
      // If none of the balanced stores has this item, use the overall best price
      if (!bestBalancedProduct || !bestBalancedStore) {
        const { bestPrice } = itemPricesByStore[itemName];
        bestBalancedProduct = bestPrice.product;
        bestBalancedStore = bestPrice.store;
      }
      
      if (!balancedSaverItems[bestBalancedStore.id]) {
        balancedSaverItems[bestBalancedStore.id] = [];
        if (!balancedVisitedStores.has(bestBalancedStore.id)) {
          balancedVisitedStores.add(bestBalancedStore.id);
          balancedSaverTotalTime += bestBalancedStore.travelTime;
        }
      }
      
      balancedSaverItems[bestBalancedStore.id].push({
        productId: bestBalancedProduct.id,
        storeId: bestBalancedStore.id,
        productName: bestBalancedProduct.name,
        storeName: bestBalancedStore.name,
        regularPrice: bestBalancedProduct.regularPrice,
        salePrice: bestBalancedProduct.salePrice,
        onSale: bestBalancedProduct.onSale
      });
      
      balancedSaverTotalCost += bestBalancedProduct.salePrice ?? bestBalancedProduct.regularPrice;
      balancedSaverRegularCost += bestBalancedProduct.regularPrice;
    }
    
    // Add transit time between stores (1 minute per transition)
    balancedSaverTotalTime += Math.max(0, balancedVisitedStores.size - 1);
    
    // Time Saver Strategy - Find the single best store
    const totalCostByStore: { [storeId: number]: number } = {};
    const regularCostByStore: { [storeId: number]: number } = {};
    const itemsByStore: { [storeId: number]: StrategyItem[] } = {};
    
    // Calculate total cost for buying all items at each store
    for (const store of allStores) {
      totalCostByStore[store.id] = 0;
      regularCostByStore[store.id] = 0;
      itemsByStore[store.id] = [];
      
      for (const itemName in itemPricesByStore) {
        const { pricesByStore } = itemPricesByStore[itemName];
        
        if (pricesByStore[store.id]) {
          const { product } = pricesByStore[store.id];
          totalCostByStore[store.id] += product.salePrice ?? product.regularPrice;
          regularCostByStore[store.id] += product.regularPrice;
          
          itemsByStore[store.id].push({
            productId: product.id,
            storeId: store.id,
            productName: product.name,
            storeName: store.name,
            regularPrice: product.regularPrice,
            salePrice: product.salePrice,
            onSale: product.onSale
          });
        } else {
          // If item is not available at this store, make it an invalid option
          totalCostByStore[store.id] = Infinity;
          break;
        }
      }
    }
    
    // Find the single best store
    let bestStoreId = 0;
    let bestStoreTotalCost = Infinity;
    
    for (const storeId in totalCostByStore) {
      if (totalCostByStore[storeId] < bestStoreTotalCost) {
        bestStoreTotalCost = totalCostByStore[storeId];
        bestStoreId = parseInt(storeId);
      }
    }
    
    const timeSaverStore = allStores.find(s => s.id === bestStoreId);
    
    if (timeSaverStore && bestStoreTotalCost < Infinity) {
      timeSaverItems[bestStoreId] = itemsByStore[bestStoreId];
    }
    
    // Create strategy objects
    const moneySaverStrategy: Omit<ShoppingStrategy, "id" | "userId"> = {
      strategyType: "money",
      totalCost: moneySaverTotalCost,
      regularCost: moneySaverRegularCost,
      totalTime: moneySaverTotalTime,
      storeCount: visitedStores.size
    };
    
    const balancedSaverStrategy: Omit<ShoppingStrategy, "id" | "userId"> = {
      strategyType: "balanced",
      totalCost: balancedSaverTotalCost,
      regularCost: balancedSaverRegularCost,
      totalTime: balancedSaverTotalTime,
      storeCount: balancedVisitedStores.size
    };
    
    const timeSaverStore2 = allStores.find(s => s.id === bestStoreId);
    const timeSaverStrategy: Omit<ShoppingStrategy, "id" | "userId"> = {
      strategyType: "time",
      totalCost: bestStoreTotalCost < Infinity ? bestStoreTotalCost : 0,
      regularCost: bestStoreTotalCost < Infinity ? regularCostByStore[bestStoreId] : 0,
      totalTime: timeSaverStore2 ? timeSaverStore2.travelTime : 0,
      storeCount: 1
    };
    
    return {
      moneySaver: {
        strategy: moneySaverStrategy,
        items: moneySaverItems
      },
      balancedSaver: {
        strategy: balancedSaverStrategy,
        items: balancedSaverItems
      },
      timeSaver: {
        strategy: timeSaverStrategy,
        items: timeSaverItems
      }
    };
  }
}

// Import the MongoDB storage implementation
import { MongoStorage } from './db/mongo-storage';

// Use MongoDB storage when a valid connection string is provided,
// otherwise fall back to in-memory storage
const useMongoStorage = !!process.env.MONGODB_URI;

export const storage = useMongoStorage
  ? new MongoStorage()
  : new MemStorage();
