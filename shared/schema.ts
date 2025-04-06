import { pgTable, text, serial, integer, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const groceryItems = pgTable("grocery_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
});

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  distance: doublePrecision("distance").notNull(),
  travelTime: integer("travel_time").notNull(), // in minutes
  address: text("address"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng")
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  storeId: integer("store_id").notNull(),
  regularPrice: doublePrecision("regular_price").notNull(),
  salePrice: doublePrecision("sale_price"),
  onSale: text("on_sale"),
});

export const shoppingStrategies = pgTable("shopping_strategies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  strategyType: text("strategy_type").notNull(), // "money", "balanced", "time"
  totalCost: doublePrecision("total_cost").notNull(),
  regularCost: doublePrecision("regular_cost").notNull(),
  totalTime: integer("total_time").notNull(), // in minutes
  storeCount: integer("store_count").notNull()
});

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGroceryItemSchema = createInsertSchema(groceryItems).pick({
  name: true,
  userId: true,
});

export const insertStoreSchema = createInsertSchema(stores).pick({
  name: true,
  distance: true,
  travelTime: true,
  address: true,
  lat: true,
  lng: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  storeId: true,
  regularPrice: true,
  salePrice: true,
  onSale: true,
});

export const insertShoppingStrategySchema = createInsertSchema(shoppingStrategies).pick({
  userId: true,
  strategyType: true,
  totalCost: true,
  regularCost: true,
  totalTime: true,
  storeCount: true,
});

// Item in a shopping strategy
export const strategyItemSchema = z.object({
  productId: z.number(),
  storeId: z.union([z.number(), z.string()]),
  productName: z.string(),
  storeName: z.string(),
  regularPrice: z.number(),
  salePrice: z.number().nullable(),
  onSale: z.string().nullable(),
});

// Request schema for strategy calculation
export const calculateStrategiesSchema = z.object({
  groceryItems: z.array(z.string()),
  userId: z.number().optional()
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGroceryItem = z.infer<typeof insertGroceryItemSchema>;
export type GroceryItem = typeof groceryItems.$inferSelect;

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
// Override for Mongo compatibility
export type MongoProduct = Omit<Product, 'storeId'> & { storeId: string };


export type InsertShoppingStrategy = z.infer<typeof insertShoppingStrategySchema>;
export type ShoppingStrategy = typeof shoppingStrategies.$inferSelect;

export type StrategyItem = z.infer<typeof strategyItemSchema>;
export type CalculateStrategiesRequest = z.infer<typeof calculateStrategiesSchema>;
