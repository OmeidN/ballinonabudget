import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { calculateStrategiesSchema, insertGroceryItemSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/grocery-items", async (req, res) => {
    // Get the user ID from the session or query (for demo purposes)
    const userId = parseInt(req.query.userId as string) || 1;
    
    try {
      const items = await storage.getGroceryItems(userId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve grocery items" });
    }
  });

  app.post("/api/grocery-items", async (req, res) => {
    try {
      // Get the user ID from the session or body (for demo purposes)
      const userId = req.body.userId || 1;
      
      const validatedData = insertGroceryItemSchema.parse({
        name: req.body.name,
        userId
      });
      
      const newItem = await storage.createGroceryItem(validatedData);
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid grocery item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create grocery item" });
      }
    }
  });

  app.delete("/api/grocery-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storage.deleteGroceryItem(id);
      if (success) {
        res.json({ message: "Grocery item deleted successfully" });
      } else {
        res.status(404).json({ message: "Grocery item not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to delete grocery item" });
    }
  });

  app.get("/api/stores", async (req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve stores" });
    }
  });

  app.post("/api/calculate-strategies", async (req, res) => {
    try {
      const validatedData = calculateStrategiesSchema.parse(req.body);
      
      // For demo, if items array is empty, return an error
      if (validatedData.groceryItems.length === 0) {
        return res.status(400).json({ message: "Please add at least one grocery item" });
      }
      
      const strategies = await storage.calculateStrategies(validatedData.groceryItems);
      res.json(strategies);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid request data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to calculate shopping strategies" });
      }
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
