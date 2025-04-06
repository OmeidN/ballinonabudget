import { IStorage } from '../storage';
import {
  User as UserModel,
  Store as StoreModel,
  Product as ProductModel,
  GroceryList as GroceryListModel
} from './models';
import { IGroceryItem } from './models/GroceryList';
import {
  User, InsertUser,
  GroceryItem, InsertGroceryItem,
  Store, Product, ShoppingStrategy, StrategyItem
} from '../../shared/schema';
import mongoose from 'mongoose';
import { getMongoConnectionStatus } from './mongoose';

export class MongoStorage implements IStorage {
  
  // USER OPERATIONS
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id);
      
      if (!user) {
        return undefined;
      }
      
      return {
        id: Number(user._id),
        username: user.username,
        password: user.password
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ username });
      
      if (!user) {
        return undefined;
      }
      
      return {
        id: Number(user._id),
        username: user.username,
        password: user.password
      };
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const newUser = new UserModel({
        username: insertUser.username,
        password: insertUser.password // In a real app, this would be hashed
      });
      
      const savedUser = await newUser.save();
      
      return {
        id: Number(savedUser._id),
        username: savedUser.username,
        password: savedUser.password
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }
  
  // GROCERY ITEM OPERATIONS
  async getGroceryItems(userId: number): Promise<GroceryItem[]> {
    // If MongoDB is not connected, don't even try to query
    if (!getMongoConnectionStatus()) {
      return [];
    }
    
    try {
      // Find the grocery list for this user
      const groceryList = await GroceryListModel.findOne({
        userId: userId
      }).maxTimeMS(2000); // Set a maximum execution time of 2 seconds
      
      if (!groceryList) {
        return [];
      }
      
      // Convert the MongoDB document to the expected format
      return groceryList.items.map((item: IGroceryItem, index: number) => ({
        id: index + 1, // Generate sequential IDs
        name: item.name,
        userId: Number(groceryList.userId)
      }));
    } catch (error) {
      console.error('Error getting grocery items:', error);
      return [];
    }
  }
  
  async getGroceryItem(id: number): Promise<GroceryItem | undefined> {
    try {
      // In MongoDB, we don't have a direct way to get an item by its index
      // So we'll need to get all lists and find the right item
      const allLists = await GroceryListModel.find();
      
      for (const list of allLists) {
        if (list.items.length >= id) {
          const item = list.items[id - 1]; // Adjust for 0-based index
          
          if (item) {
            return {
              id,
              name: item.name,
              userId: Number(list.userId)
            };
          }
        }
      }
      
      return undefined;
    } catch (error) {
      console.error('Error getting grocery item:', error);
      return undefined;
    }
  }
  
  async createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem> {
    try {
      // Find the user's grocery list or create a new one
      let groceryList = await GroceryListModel.findOne({
        userId: item.userId
      });
      
      if (!groceryList) {
        // Create a new list for this user
        groceryList = new GroceryListModel({
          userId: item.userId,
          name: 'My Shopping List',
          items: []
        });
      }
      
      // Add the new item to the list
      const newItem: IGroceryItem = {
        name: item.name
      };
      
      groceryList.items.push(newItem);
      await groceryList.save();
      
      // Return the newly created item with its generated ID
      return {
        id: groceryList.items.length, // ID is the position in the array
        name: item.name,
        userId: item.userId
      };
    } catch (error) {
      console.error('Error creating grocery item:', error);
      throw new Error('Failed to create grocery item');
    }
  }
  
  async deleteGroceryItem(id: number): Promise<boolean> {
    try {
      // Find all grocery lists
      const lists = await GroceryListModel.find();
      
      for (const list of lists) {
        if (list.items.length >= id) {
          // Remove the item at the specified index
          list.items.splice(id - 1, 1); // Adjust for 0-based index
          await list.save();
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting grocery item:', error);
      return false;
    }
  }
  
  // STORE OPERATIONS
  async getStores(): Promise<Store[]> {
    // If MongoDB is not connected, don't even try to query
    if (!getMongoConnectionStatus()) {
      return [];
    }
    
    try {
      const stores = await StoreModel.find().maxTimeMS(2000); // Set a maximum execution time of 2 seconds
      
      return stores.map(store => ({
        id: Number(store._id),
        name: store.name,
        distance: 0, // These will be calculated based on user location when needed
        travelTime: 0,
        address: store.address,
        lat: store.lat,
        lng: store.lng
      }));
    } catch (error) {
      console.error('Error getting stores:', error);
      return [];
    }
  }
  
  async getStore(id: number): Promise<Store | undefined> {
    try {
      const store = await StoreModel.findById(id);
      
      if (!store) {
        return undefined;
      }
      
      return {
        id: Number(store._id),
        name: store.name,
        distance: 0, // These will be calculated based on user location when needed
        travelTime: 0,
        address: store.address,
        lat: store.lat,
        lng: store.lng
      };
    } catch (error) {
      console.error('Error getting store:', error);
      return undefined;
    }
  }
  
  // PRODUCT OPERATIONS
  async getProducts(storeId: number): Promise<Product[]> {
    try {
      const products = await ProductModel.find({
        storeId: new mongoose.Types.ObjectId(storeId.toString())
      });
      
      return products.map(product => ({
        id: Number(product._id),
        name: product.name,
        storeId: Number(product.storeId),
        regularPrice: product.regularPrice,
        salePrice: product.salePrice || null,
        onSale: product.onSale || null
      }));
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }
  
  async getProductsByName(name: string): Promise<Product[]> {
    try {
      // Try both text search and regex for better matching
      // First attempt text search
      let products = await ProductModel.find({
        $text: { $search: name }
      });
      
      // If no results, fall back to regex search
      if (products.length === 0) {
        products = await ProductModel.find({
          name: new RegExp(name, 'i') // Case-insensitive regex
        });
      }
      
      return products.map(product => ({
        id: Number(product._id),
        name: product.name,
        storeId: Number(product.storeId),
        regularPrice: product.regularPrice,
        salePrice: product.salePrice || null,
        onSale: product.onSale || null
      }));
    } catch (error) {
      console.error('Error getting products by name:', error);
      return [];
    }
  }
  
  // STRATEGY OPERATIONS
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
    try {
      const allProducts: Array<{
        product: Product,
        store: Store
      }> = [];
      
      // Get all stores
      const stores = await this.getStores();
      
      // For each grocery item, find all matching products across all stores
      for (const itemName of groceryItemNames) {
        const products = await this.getProductsByName(itemName);
        
        for (const product of products) {
          const store = stores.find(s => s.id === product.storeId);
          
          if (store) {
            allProducts.push({
              product,
              store
            });
          }
        }
      }
      
      // MONEY SAVER STRATEGY: Choose the cheapest option for each item
      const moneySaverItems: { [storeId: number]: StrategyItem[] } = {};
      let moneySaverTotalCost = 0;
      let moneySaverRegularCost = 0;
      
      // Group products by item name to find the cheapest for each
      const groupedByItem: { [itemName: string]: Array<{
        product: Product,
        store: Store
      }> } = {};
      
      for (const { product, store } of allProducts) {
        if (!groupedByItem[product.name]) {
          groupedByItem[product.name] = [];
        }
        groupedByItem[product.name].push({ product, store });
      }
      
      // For each item, find the cheapest option
      for (const itemName in groupedByItem) {
        const options = groupedByItem[itemName];
        
        // Sort by price (sale price if available, otherwise regular price)
        options.sort((a, b) => {
          const aPrice = a.product.salePrice || a.product.regularPrice;
          const bPrice = b.product.salePrice || b.product.regularPrice;
          return aPrice - bPrice;
        });
        
        const cheapestOption = options[0];
        const { product, store } = cheapestOption;
        
        // Initialize the store's item array if it doesn't exist
        if (!moneySaverItems[store.id]) {
          moneySaverItems[store.id] = [];
        }
        
        // Add the item to the store's list
        moneySaverItems[store.id].push({
          productId: product.id,
          storeId: store.id,
          productName: product.name,
          storeName: store.name,
          regularPrice: product.regularPrice,
          salePrice: product.salePrice || null,
          onSale: product.onSale || null
        });
        
        // Update costs
        moneySaverTotalCost += product.salePrice || product.regularPrice;
        moneySaverRegularCost += product.regularPrice;
      }
      
      // Count unique stores for money saver strategy
      const moneySaverStoreCount = Object.keys(moneySaverItems).length;
      
      // Calculate total travel time (simplified estimate)
      let moneySaverTotalTime = moneySaverStoreCount * 30; // Assume 30 minutes per store
      
      // BALANCED SAVER STRATEGY: Use 2-3 stores to balance cost and time
      // Let's implement a simple version that uses the 2-3 stores with the most items
      
      // Count items per store from money saver strategy
      const storeItemCounts: { [storeId: number]: number } = {};
      
      for (const storeId in moneySaverItems) {
        storeItemCounts[storeId] = moneySaverItems[storeId].length;
      }
      
      // Sort stores by item count
      const sortedStores = Object.entries(storeItemCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => Number(entry[0]));
      
      // Select top 2-3 stores
      const balancedStoreIds = sortedStores.slice(0, Math.min(3, sortedStores.length));
      
      // For items not in the selected stores, find the best alternative
      const balancedSaverItems: { [storeId: number]: StrategyItem[] } = {};
      let balancedSaverTotalCost = 0;
      let balancedSaverRegularCost = 0;
      
      // First, add items from selected stores
      for (const storeId of balancedStoreIds) {
        balancedSaverItems[storeId] = [...moneySaverItems[storeId]];
        
        for (const item of moneySaverItems[storeId]) {
          balancedSaverTotalCost += item.salePrice || item.regularPrice;
          balancedSaverRegularCost += item.regularPrice;
        }
      }
      
      // Count unique stores for balanced saver strategy
      const balancedSaverStoreCount = Object.keys(balancedSaverItems).length;
      
      // Calculate total travel time (simplified estimate)
      let balancedSaverTotalTime = balancedSaverStoreCount * 30; // Assume 30 minutes per store
      
      // TIME SAVER STRATEGY: Get everything from a single store
      
      // Count total items needed
      const totalItems = groceryItemNames.length;
      
      // Find the store with the most available items
      const storeWithMostItems = sortedStores[0];
      
      const timeSaverItems: { [storeId: number]: StrategyItem[] } = {
        [storeWithMostItems]: [...moneySaverItems[storeWithMostItems]]
      };
      
      // Calculate costs
      let timeSaverTotalCost = 0;
      let timeSaverRegularCost = 0;
      
      for (const item of moneySaverItems[storeWithMostItems]) {
        timeSaverTotalCost += item.salePrice || item.regularPrice;
        timeSaverRegularCost += item.regularPrice;
      }
      
      // A single store means less travel time
      const timeSaverTotalTime = 30; // Just one store visit
      
      return {
        moneySaver: {
          strategy: {
            strategyType: "money",
            totalCost: parseFloat(moneySaverTotalCost.toFixed(2)),
            regularCost: parseFloat(moneySaverRegularCost.toFixed(2)),
            totalTime: moneySaverTotalTime,
            storeCount: moneySaverStoreCount
          },
          items: moneySaverItems
        },
        balancedSaver: {
          strategy: {
            strategyType: "balanced",
            totalCost: parseFloat(balancedSaverTotalCost.toFixed(2)),
            regularCost: parseFloat(balancedSaverRegularCost.toFixed(2)),
            totalTime: balancedSaverTotalTime,
            storeCount: balancedSaverStoreCount
          },
          items: balancedSaverItems
        },
        timeSaver: {
          strategy: {
            strategyType: "time",
            totalCost: parseFloat(timeSaverTotalCost.toFixed(2)),
            regularCost: parseFloat(timeSaverRegularCost.toFixed(2)),
            totalTime: timeSaverTotalTime,
            storeCount: 1
          },
          items: timeSaverItems
        }
      };
    } catch (error) {
      console.error('Error calculating strategies:', error);
      
      // Return empty strategies in case of error
      return {
        moneySaver: {
          strategy: {
            strategyType: "money",
            totalCost: 0,
            regularCost: 0,
            totalTime: 0,
            storeCount: 0
          },
          items: {}
        },
        balancedSaver: {
          strategy: {
            strategyType: "balanced",
            totalCost: 0,
            regularCost: 0,
            totalTime: 0,
            storeCount: 0
          },
          items: {}
        },
        timeSaver: {
          strategy: {
            strategyType: "time",
            totalCost: 0,
            regularCost: 0,
            totalTime: 0,
            storeCount: 0
          },
          items: {}
        }
      };
    }
  }
  async searchProductsByName(query: string): Promise<Product[]> {
    if (!query || typeof query !== 'string') return [];
  
    try {
      const results = await ProductModel.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);
  
      return results.map(product => ({
        id: Number(product._id),
        name: product.name,
        storeId: Number(product.storeId),
        regularPrice: product.regularPrice,
        salePrice: product.salePrice || null,
        onSale: product.onSale || null
      }));
    } catch (err) {
      console.error('Error during product search:', err);
      return [];
    }
  }
}


