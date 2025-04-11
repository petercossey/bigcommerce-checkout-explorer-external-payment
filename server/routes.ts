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

  // Create checkout token
  app.post("/api/bigcommerce/checkout-token", async (req: Request, res: Response) => {
    try {
      const { storeHash, accessToken, checkoutId } = req.body;
      
      if (!storeHash || !accessToken || !checkoutId) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      console.log(`Generating token for checkout ${checkoutId}`);

      // For demonstration purposes, we'll use a mock token rather than hitting the API
      // In a production environment, you would use the actual API call
      console.log("Using mock token for demonstration purposes");
      
      // Generate a mock token based on the checkout ID for consistency
      const mockToken = `demo-token-${checkoutId.substring(0, 8)}`;
      
      return res.json({ 
        token: mockToken,
        _note: "This is a demo token for testing the payment middleware flow"
      });
      
      /* Uncomment this section to use the actual API instead of a mock token
      const response = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v3/checkouts/${checkoutId}/token`,
        {
          method: "POST",
          headers: {
            "X-Auth-Token": accessToken,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({}) // Send empty JSON body as required by the API
        }
      );
      
      if (!response.ok) {
        const text = await response.text();
        console.error(`Token generation failed: ${response.status} ${response.statusText}`, text);
        return res.status(response.status).json({ 
          error: `API Error: ${response.status} ${response.statusText}`,
          details: text
        });
      }
      
      // Only try to parse JSON if we have a successful response
      try {
        const data = await response.json();
        return res.json(data);
      } catch (jsonError) {
        console.error("Error parsing token response:", jsonError);
        // If the response is not valid JSON but the request was successful,
        // create a mock token for testing purposes
        return res.json({ 
          token: "dummy-token-for-testing",
          note: "This is a fallback token since the API response was not valid JSON"
        });
      }
      */
    } catch (error) {
      console.error("Error generating checkout token:", error);
      return res.status(500).json({ error: "Failed to generate checkout token" });
    }
  });

  // Create order from checkout
  app.post("/api/bigcommerce/create-order", async (req: Request, res: Response) => {
    try {
      const { storeHash, accessToken, checkoutId } = req.body;
      
      if (!storeHash || !accessToken || !checkoutId) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      console.log(`Creating order for checkout ${checkoutId}`);
      
      // For demonstration purposes, we'll use a mock order rather than hitting the API
      // In a production environment, you would use the actual API call
      console.log("Using mock order for demonstration purposes");
      
      // Generate a mock order ID
      const mockOrderId = Math.floor(100000 + Math.random() * 900000);
      
      return res.json({
        data: {
          id: mockOrderId,
          checkout_id: checkoutId,
          status: {
            id: 0,
            label: "Incomplete"
          },
          _note: "This is a mock order for demonstration purposes"
        },
        meta: {}
      });
      
      /* Uncomment this section to use the actual API instead of a mock order
      const response = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v3/checkouts/${checkoutId}/orders`,
        {
          method: "POST",
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
      */
    } catch (error) {
      console.error("Error creating order:", error);
      return res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Update order status and payment information
  app.post("/api/bigcommerce/update-order", async (req: Request, res: Response) => {
    try {
      const { storeHash, accessToken, orderId, orderData } = req.body;
      
      if (!storeHash || !accessToken || !orderId || !orderData) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      console.log(`Updating order ${orderId} with data:`, orderData);
      
      // For demonstration purposes, we'll use a mock response rather than hitting the API
      // In a production environment, you would use the actual API call
      console.log("Using mock order update for demonstration purposes");
      
      // Return a mock success response
      return res.json({
        id: orderId,
        status_id: orderData.status_id,
        payment_method: orderData.payment_method,
        payment_provider_id: orderData.payment_provider_id,
        _note: "This is a mock order update for demonstration purposes"
      });
      
      /* Uncomment this section to use the actual API instead of a mock update
      const response = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v2/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "X-Auth-Token": accessToken,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(orderData)
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      } else {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          return res.status(response.status).json({
            error: errorMessage,
            details: errorData
          });
        } catch (e) {
          return res.status(response.status).json({ error: errorMessage });
        }
      }
      */
    } catch (error) {
      console.error("Error updating order:", error);
      return res.status(500).json({ error: "Failed to update order" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
