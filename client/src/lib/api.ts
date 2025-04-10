import { Checkout } from "../types/checkout";

/**
 * Check if the store hash and access token are valid
 */
export async function validateCredentials(
  storeHash: string,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.bigcommerce.com/stores/${storeHash}/v3/catalog/summary`,
      {
        headers: {
          "X-Auth-Token": accessToken,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return response.ok;
  } catch (error) {
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
  const response = await fetch(
    `https://api.bigcommerce.com/stores/${storeHash}/v3/checkouts/${checkoutId}`,
    {
      headers: {
        "X-Auth-Token": accessToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch checkout: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}
