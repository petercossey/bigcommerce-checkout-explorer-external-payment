import { Checkout } from "../types/checkout";

/**
 * Check if the store hash and access token are valid
 */
export async function validateCredentials(
  storeHash: string,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/bigcommerce/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ storeHash, accessToken }),
    });
    
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Error validating credentials:", error);
    return false;
  }
}

/**
 * Fetch checkout data by ID
 */
export async function fetchCheckout(
  storeHash: string,
  accessToken: string,
  checkoutId: string
): Promise<Checkout> {
  const response = await fetch("/api/bigcommerce/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ storeHash, accessToken, checkoutId }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch checkout: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // If we can't parse the error as JSON, just use the default error message
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
}

/**
 * Convert checkout to order
 */
export async function convertCheckoutToOrder(
  storeHash: string,
  accessToken: string,
  checkoutId: string
) {
  const response = await fetch("/api/bigcommerce/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ storeHash, accessToken, checkoutId }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create order: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // If we can't parse the error as JSON, just use the default error message
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
}

/**
 * Update order status and payment information
 */
export async function updateOrderStatus(
  storeHash: string,
  accessToken: string,
  orderId: number,
  orderData: {
    payment_method: string;
    payment_provider_id: string;
    status_id: number;
  }
) {
  const response = await fetch("/api/bigcommerce/update-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      storeHash, 
      accessToken, 
      orderId, 
      orderData 
    }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update order: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // If we can't parse the error as JSON, just use the default error message
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
}
