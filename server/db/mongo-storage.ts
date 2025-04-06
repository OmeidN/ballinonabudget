// server/db/mongo-storage.ts

import UserModel from "./models/User";
import { InsertUser, User } from "../../shared/schema";
import { IStorage } from "../storage";

export const mongoStorage: IStorage = {
  async getUser(id: number): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    if (!user) return undefined;
    return {
      id: Number(user._id),
      email: user.email,
      passwordHash: user.passwordHash,
    };
  },

  async getUserByUsername(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    if (!user) return undefined;
    return {
      id: Number(user._id),
      email: user.email,
      passwordHash: user.passwordHash,
    };
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

  async getGroceryItems() {
    return [];
  },
  async getGroceryItem() {
    return undefined;
  },
  async createGroceryItem() {
    return { id: 1, name: "test", userId: 1 };
  },
  async deleteGroceryItem() {
    return false;
  },

  async getStores() {
    return [];
  },
  async getStore() {
    return undefined;
  },

  async getProducts() {
    return [];
  },
  async getProductsByName() {
    return [];
  },
  async searchProductsByName() {
    return [];
  },

  async calculateStrategies(groceryItems: string[]) {
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
  },
};
