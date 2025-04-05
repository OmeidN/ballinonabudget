import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { calculateStrategiesSchema, insertGroceryItemSchema } from "@shared/schema";
import { ZodError } from "zod";
import { default as dataScraperService } from './services/data-scraper';
import { scrapers } from './scrapers';
import StoreModel from './db/models/Store'; 

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

  // Add a route to manually trigger data scraping (admin only in a real app)
  app.post("/api/admin/initialize-stores", async (req, res) => {
    try {
      await dataScraperService.initializeStores();
      res.json({ message: "Stores initialized successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to initialize stores" });
    }
  });
  
  app.post("/api/admin/scrape-stores", async (req, res) => {
    try {
      await dataScraperService.scrapeAllStores();
      res.json({ message: "Store data scraped successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to scrape store data" });
    }
  });

  app.get("/api/scrape/:store", async (req, res) => {
    const store = req.params.store.toLowerCase();

    if (!scrapers[store]) {
      return res.status(404).json({ message: `No scraper found for "${store}"` });
    }

    try {
      const data = await scrapers[store].scrape();
      res.json({ store, data });
    } catch (error) {
      console.error(`❌ Error scraping ${store}:`, error);
      res.status(500).json({ message: `Failed to scrape ${store}` });
    }
  });

  app.get('/api/stores/nearby', async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusInMiles = parseFloat(req.query.radius as string) || 10;
  
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'Missing or invalid latitude/longitude.' });
    }
  
    const radiusInMeters = radiusInMiles * 1609.34;
  
    try {
      const nearbyStores = await StoreModel.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat],
            },
            $maxDistance: radiusInMeters
          }
        }
      });
  
      res.json(nearbyStores);
    } catch (error) {
      console.error('Error fetching nearby stores:', error);
      res.status(500).json({ message: 'Failed to retrieve nearby stores.' });
    }
  });
  
  
  // Store initialization is now handled in index.ts

  const httpServer = createServer(app);

  return httpServer;
}
