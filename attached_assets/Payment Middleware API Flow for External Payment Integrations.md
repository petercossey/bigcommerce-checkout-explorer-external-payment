# Payment Middleware API Flow for External Payment Integrations

## Overview

This document outlines the required API flow for a payment middleware service that integrates an external payment provider with BigCommerce using a custom payment form.

The flow is also referenced in the following screencast: [Replacing payment section of default checkout and loading order confirmation page](https://www.loom.com/share/0cd550ffea6f4431aff2bf81ce374563?sid=0e15db82-962b-4a59-968c-b9e995ddcfda) (Loom video 5mins)

---

## Step-by-Step Breakdown

### 1\. Shopper completes customer, shipping, and billing sections

* The shopper uses the BigCommerce native checkout (or custom checkout) to enter all necessary customer, shipping, and billing information.

### 2\. Shopper uses the custom payment form

* A custom payment form (embedded/headless or via a remote widget) is used instead of BigCommerce's native payment options.

### 3\. Payment form calls external middleware to process the payment

* When submitted, the form sends data such as checkout ID and any relevant payment method tokens to the middleware service.

---

## ⚙️ Middleware Responsibilities

### 4a. Load checkout (from client-side checkout request)

* Retrieve checkout details to confirm state and gather required data.

Request:

```
GET /v3/checkouts/{checkout_id}
Authorization: X-Auth-Token {access_token}
```

Purpose:

* Validate checkout state  
* Extract cart, customer, address, and pricing details

---

### 4b. Create Checkout Token

* Generate a token associated with the checkout. This token is required for secure access to the order confirmation page later.

Request:

```
POST /v3/checkouts/{checkout_id}/token
Authorization: X-Auth-Token {access_token}
```

Response:

```
{
  "token": "{checkout_token}"
}
```

---

### 4c. Create order via BigCommerce v3 Checkout API

* Finalize the checkout by converting it into an order before processing payment.  
* The order will initially have a status of 0 (Incomplete), and the checkout object will remain accessible until the status is changed.

Request:

```
POST /v3/checkouts/{checkout_id}/orders
Authorization: X-Auth-Token {access_token}
```

Response:

* Returns `order.id` and related details

---

### 4d. Process payment with provider

* Use the payment token and order amount to authorize the transaction with the external provider.  
* Handle any required 3DS authentication or async flow.

---

### 4e. Update order fields via v2 Orders API

* Update the order with payment information and set an appropriate status to indicate the order has been paid.  
* Most commonly, the status is updated to 11 (Awaiting Fulfillment), but other valid status values may be used depending on your flow and business logic.

Request:

```
PUT /v2/orders/{order_id}
Content-Type: application/json
Authorization: X-Auth-Token {access_token}
```

```
PUT /v2/orders/{order_id}
Content-Type: application/json
Authorization: X-Auth-Token {access_token}
```

Payload:

```
{
  "payment_method": "CustomPay",
  "payment_provider_id": "transaction_id_123456789",
  "status_id": 11
}
```

---

## ✅ 5\. On success: Redirect to confirmation page

After successful order update, redirect the shopper to:

```
/checkout/order-confirmation/{order_id}?t={checkout_token}
```

* order\_id: Returned from the order creation response  
* checkout\_token: From the checkout token created earlier

---

This flow ensures secure and seamless integration of external payment services within the BigCommerce checkout experience.  
