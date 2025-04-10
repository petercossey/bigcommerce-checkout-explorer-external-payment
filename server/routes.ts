import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fetch from "node-fetch";

export async function registerRoutes(app: Express): Promise<Server> {
  // BigCommerce API proxy endpoints
  app.post("/api/bigcommerce/validate", async (req: Request, res: Response) => {
    try {
      const { storeHash, accessToken } = req.body;
      
      if (!storeHash || !accessToken) {
        return res.status(400).json({ error: "Missing store hash or access token" });
      }
      
      const response = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/summary`,
        {
          headers: {
            "X-Auth-Token": accessToken,
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
      
      if (response.ok) {
        return res.json({ success: true });
      } else {
        return res.status(response.status).json({ 
          success: false, 
          error: `API Error: ${response.status} ${response.statusText}`
        });
      }
    } catch (error) {
      console.error("Error validating API credentials:", error);
      return res.status(500).json({ error: "Failed to validate API credentials" });
    }
  });
  
  app.post("/api/bigcommerce/checkout", async (req: Request, res: Response) => {
    try {
      const { storeHash, accessToken, checkoutId } = req.body;
      
      if (!storeHash || !accessToken || !checkoutId) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      const response = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v3/checkouts/${checkoutId}`,
        {
          headers: {
            "X-Auth-Token": accessToken,
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        return res.json(data);
      } else {
        return res.status(response.status).json({ 
          error: `API Error: ${response.status} ${response.statusText}`,
          details: data
        });
      }
    } catch (error) {
      console.error("Error fetching checkout data:", error);
      return res.status(500).json({ error: "Failed to fetch checkout data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
