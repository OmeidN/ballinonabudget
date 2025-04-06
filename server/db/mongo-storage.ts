import UserModel from "./models/User";
import ProductModel from "./models/Product";
import StoreModel from "./models/Store";
import GroceryItemModel from "./models/GroceryItem";

import {
  User,
  InsertUser,
  GroceryItem,
  InsertGroceryItem,
  Store,
  Product,
  CalculateStrategiesRequest,
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

  async calculateStrategies(
    groceryItems: string[]
  ): Promise<{
    moneySaver: {
      strategy: {
        strategyType: string;
        totalCost: number;
        regularCost: number;
        totalTime: number;
        storeCount: number;
      };
      items: Record<string, any[]>;
    };
    balancedSaver: {
      strategy: {
        strategyType: string;
        totalCost: number;
        regularCost: number;
        totalTime: number;
        storeCount: number;
      };
      items: Record<string, any[]>;
    };
    timeSaver: {
      strategy: {
        strategyType: string;
        totalCost: number;
        regularCost: number;
        totalTime: number;
        storeCount: number;
      };
      items: Record<string, any[]>;
    };
  }> {
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
  },
};
