import UserModel from "./models/User";
import ProductModel from "./models/Product";
import StoreModel from "./models/Store";
import GroceryItemModel from "./models/GroceryItem";
import ShoppingStrategyModel from "./models/ShoppingStrategy";

import {
  User,
  InsertUser,
  GroceryItem,
  InsertGroceryItem,
  Store,
  Product,
  StrategyItem,
  CalculateStrategiesResponse,
  SaveStrategyRequest,
  SavedStrategyResponse,
} from "../../shared/schema";

export const mongoStorage = {
  async getUser(id: number): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    return user
      ? {
          id: Number(user._id),
          email: user.email,
          passwordHash: user.passwordHash,
        }
      : undefined;
  },

  async getUserByUsername(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    return user
      ? {
          id: Number(user._id),
          email: user.email,
          passwordHash: user.passwordHash,
        }
      : undefined;
  },

  async createUser(user: InsertUser): Promise<User> {
    const newUser = new UserModel(user);
    const savedUser = await newUser.save();
    return {
      id: Number(savedUser._id),
      email: savedUser.email,
      passwordHash: savedUser.passwordHash,
    };
  },

  async getGroceryItems(userId: number): Promise<GroceryItem[]> {
    const items = await GroceryItemModel.find({ userId });
    return items.map(item => ({
      id: Number(item._id),
      name: item.name,
      userId: item.userId,
    }));
  },

  async getGroceryItem(id: number): Promise<GroceryItem | undefined> {
    const item = await GroceryItemModel.findById(id);
    return item
      ? {
          id: Number(item._id),
          name: item.name,
          userId: item.userId,
        }
      : undefined;
  },

  async createGroceryItem(item: InsertGroceryItem): Promise<GroceryItem> {
    const newItem = new GroceryItemModel(item);
    const savedItem = await newItem.save();
    return {
      id: Number(savedItem._id),
      name: savedItem.name,
      userId: savedItem.userId,
    };
  },

  async deleteGroceryItem(id: number): Promise<boolean> {
    const result = await GroceryItemModel.findByIdAndDelete(id);
    return result !== null;
  },

  async getStores(): Promise<Store[]> {
    const stores = await StoreModel.find();
    return stores.map(store => ({
      id: Number(store._id),
      name: store.name,
      address: store.address || null,
      lat: store.lat || null,
      lng: store.lng || null,
      distance: 0,
      travelTime: 0,
    }));
  },

  async getStore(id: number): Promise<Store | undefined> {
    const store = await StoreModel.findById(id);
    return store
      ? {
          id: Number(store._id),
          name: store.name,
          address: store.address || null,
          lat: store.lat || null,
          lng: store.lng || null,
          distance: 0,
          travelTime: 0,
        }
      : undefined;
  },

  async getProducts(storeId?: number): Promise<Product[]> {
    const query = storeId ? { storeId } : {};
    const products = await ProductModel.find(query);
    return products.map(p => ({
      id: Number(p._id),
      name: p.name,
      storeId: p.storeId,
      regularPrice: p.regularPrice,
      salePrice: p.salePrice,
      onSale: p.onSale,
      brand: p.brand,
      size: p.size,
      lastUpdated: p.lastUpdated,
    }));
  },

  async getProductsByName(name: string): Promise<Product[]> {
    const products = await ProductModel.find({
      name: { $regex: new RegExp(name, "i") },
    });
    return products.map(p => ({
      id: Number(p._id),
      name: p.name,
      storeId: p.storeId,
      regularPrice: p.regularPrice,
      salePrice: p.salePrice,
      onSale: p.onSale,
      brand: p.brand,
      size: p.size,
      lastUpdated: p.lastUpdated,
    }));
  },

  async searchProductsByName(query: string): Promise<Product[]> {
    const regex = new RegExp(query, "i");
    const products = await ProductModel.find({ name: { $regex: regex } });
    return products.map(p => ({
      id: Number(p._id),
      name: p.name,
      storeId: p.storeId,
      regularPrice: p.regularPrice,
      salePrice: p.salePrice,
      onSale: p.onSale,
      brand: p.brand,
      size: p.size,
      lastUpdated: p.lastUpdated,
    }));
  },

  async calculateStrategies(groceryItems: string[]): Promise<CalculateStrategiesResponse> {
    const allProducts = await ProductModel.find({
      name: { $in: groceryItems.map(item => new RegExp(item, "i")) },
    });

    const cheapestMap: Record<string, StrategyItem> = {};
    const oneStopMap: Record<string, StrategyItem[]> = {};

    for (const product of allProducts) {
      const price = product.salePrice ?? product.regularPrice;

      if (!cheapestMap[product.name] || price < cheapestMap[product.name].salePrice!) {
        cheapestMap[product.name] = {
          productId: Number(product._id),
          productName: product.name,
          storeId: product.storeId,
          storeName: "",
          regularPrice: product.regularPrice,
          salePrice: product.salePrice,
          onSale: product.onSale,
        };
      }

      if (!oneStopMap[product.storeId]) {
        oneStopMap[product.storeId] = [];
      }
      oneStopMap[product.storeId].push({
        productId: Number(product._id),
        productName: product.name,
        storeId: product.storeId,
        storeName: "",
        regularPrice: product.regularPrice,
        salePrice: product.salePrice,
        onSale: product.onSale,
      });
    }

    const moneySaverItems = Object.values(cheapestMap);
    const timeSaverStoreId = Object.entries(oneStopMap).sort((a, b) => b[1].length - a[1].length)[0]?.[0];
    const timeSaverItems = timeSaverStoreId ? oneStopMap[timeSaverStoreId] : [];
    const balancedItems = moneySaverItems.slice(0, Math.floor(moneySaverItems.length / 1.5));

    const sum = (arr: StrategyItem[]) =>
      arr.reduce((acc, item) => acc + (item.salePrice ?? item.regularPrice), 0);

    const makeStrategy = (items: StrategyItem[], strategyType: string) => ({
      strategy: {
        strategyType,
        totalCost: sum(items),
        regularCost: sum(items),
        totalTime: items.length * 5,
        storeCount: new Set(items.map(i => i.storeId)).size,
      },
      items: items.reduce((acc, item) => {
        const id = item.storeId.toString();
        if (!acc[id]) acc[id] = [];
        acc[id].push(item);
        return acc;
      }, {} as Record<string, StrategyItem[]>),
    });

    return {
      moneySaver: makeStrategy(moneySaverItems, "money"),
      balancedSaver: makeStrategy(balancedItems, "balanced"),
      timeSaver: makeStrategy(timeSaverItems, "time"),
    };
  },

  async saveStrategy(data: SaveStrategyRequest): Promise<SavedStrategyResponse> {
    const { userId, strategyType, items } = data;

    const totalCost = items.reduce((sum, item) => sum + (item.salePrice ?? item.regularPrice), 0);
    const regularCost = items.reduce((sum, item) => sum + item.regularPrice, 0);
    const storeCount = new Set(items.map(i => i.storeId)).size;

    const strategy = new ShoppingStrategyModel({
      userId,
      strategyType,
      totalCost,
      regularCost,
      totalTime: 0,
      storeCount,
    });

    const saved = await strategy.save();

    return {
      strategyId: Number(saved._id),
      message: "Strategy saved successfully",
    };
  },
};
