import { IStorage } from "./types";
import { mongoStorage } from "./db/mongo-storage";
import { MemStorage } from "./db/memory-storage";
import { USE_MONGO } from "./env";

// Ensure both branches conform to IStorage
const memoryStorage = new MemStorage();

export const storage: IStorage =
  USE_MONGO === "true" ? mongoStorage : memoryStorage;
