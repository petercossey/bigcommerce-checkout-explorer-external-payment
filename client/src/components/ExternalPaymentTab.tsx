import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkout } from "../types/checkout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClipboardCopy, CheckCircle2, AlertCircle } from "lucide-react";
import { convertCheckoutToOrder, getOrderDetails, updateOrderStatus } from "../lib/api";

// Status options from BigCommerce Orders API
const ORDER_STATUSES = [
  { id: 0, name: "Incomplete" },
  { id: 1, name: "Pending" },
  { id: 2, name: "Shipped" },
  { id: 3, name: "Partially Shipped" },
  { id: 4, name: "Refunded" },
  { id: 5, name: "Cancelled" },
  { id: 6, name: "Declined" },
  { id: 7, name: "Awaiting Payment" },
  { id: 8, name: "Awaiting Pickup" },
  { id: 9, name: "Awaiting Shipment" },
  { id: 10, name: "Completed" },
  { id: 11, name: "Awaiting Fulfillment" },
  { id: 12, name: "Manual Verification Required" },
  { id: 13, name: "Disputed" },
  { id: 14, name: "Partially Refunded" },
];

// Form schema for payment processing
const formSchema = z.object({
  paymentMethod: z.string().min(1, "Payment method is required"),
  paymentProviderId: z.string().min(1, "Payment provider ID is required"),
  statusId: z.string().min(1, "Status is required"),
});

type FormData = z.infer<typeof formSchema>;

interface ExternalPaymentTabProps {
  checkoutData: Checkout;
  storeHash: string;
  accessToken: string;
  storeUrl?: string;
}

export default function ExternalPaymentTab({
  checkoutData,
  storeHash,
  accessToken,
  storeUrl = "",
}: ExternalPaymentTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationUrl, setConfirmationUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: "ExternalPayment",
      paymentProviderId: "transaction_123456789",
      statusId: "11", // Default to "Awaiting Fulfillment"
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setConfirmationUrl(null);
    setDebugInfo([]);

    try {
      const checkoutId = checkoutData.data.id;
      const logs: string[] = [];

      logs.push("Starting payment middleware flow...");
      logs.push(`Checkout ID: ${checkoutId}`);

      // Step 1: Generate checkout token
      logs.push("Step 1: Generating checkout token...");
      
      const tokenResponse = await fetch(`/api/bigcommerce/checkout-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storeHash, accessToken, checkoutId }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        logs.push(`Token generation failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
        logs.push(`Error details: ${errorText}`);
        throw new Error(`Failed to generate checkout token: ${tokenResponse.status} ${tokenResponse.statusText}`);
      }
      
      const tokenData = await tokenResponse.json();
      
      // Handle both direct token format and nested data format returned by BigCommerce API
      let token;
      if (tokenData.token) {
        // Format from our fallback generator
        token = tokenData.token;
        logs.push("Using fallback-generated token");
      } else if (tokenData.data && tokenData.data.checkoutToken) {
        // Format from BigCommerce API
        token = tokenData.data.checkoutToken;
        logs.push("Using BigCommerce API-generated token");
      } else {
        logs.push("Token response did not contain a token in any expected format");
        logs.push(`Response data: ${JSON.stringify(tokenData, null, 2)}`);
        throw new Error("Token response did not contain a token in any expected format");
      }
      
      logs.push(`Token generated successfully: ${token}`);

      // Step 2: Convert checkout to order
      logs.push("Step 2: Converting checkout to order...");
      
      let createdOrderId: number | null = null;
      
      try {
        const orderData = await convertCheckoutToOrder(storeHash, accessToken, checkoutId);
        createdOrderId = orderData.data.id;
        
        if (!createdOrderId) {
          logs.push("Order response did not contain an order ID");
          throw new Error("Order response did not contain an order ID");
        }
        
        logs.push(`Order created successfully with ID: ${createdOrderId}`);
  
        // Step 3: Get order details
        logs.push("Step 3: Getting order details...");
        
        try {
          const orderDetails = await getOrderDetails(storeHash, accessToken, createdOrderId);
          logs.push(`Order details retrieved successfully: ${JSON.stringify(orderDetails, null, 2).substring(0, 200)}...`);
          
          // Step 4: Update order with payment information
          logs.push("Step 4: Updating order with payment information...");
          
          try {
            const updateData = await updateOrderStatus(storeHash, accessToken, createdOrderId, {
              payment_method: data.paymentMethod,
              payment_provider_id: data.paymentProviderId,
              status_id: parseInt(data.statusId)
            });
            
            logs.push("Order updated successfully");
          } catch (updateError) {
            logs.push(`Order update failed: ${updateError instanceof Error ? updateError.message : "Unknown error"}`);
            throw updateError;
          }
        } catch (detailsError) {
          logs.push(`Order details retrieval failed: ${detailsError instanceof Error ? detailsError.message : "Unknown error"}`);
          throw detailsError;
        }
      } catch (orderError) {
        logs.push(`Order creation failed: ${orderError instanceof Error ? orderError.message : "Unknown error"}`);
        throw orderError;
      }

      // Step 5: Set confirmation URL
      logs.push("Step 5: Flow completed - generating confirmation URL");
      const finalStoreUrl = storeUrl || "https://yourstore.mybigcommerce.com"; // Use provided URL or fallback
      if (createdOrderId) {
        // Format: {store_url}/checkout/order-confirmation/{order_id}?t={checkout_token}
        setConfirmationUrl(`${finalStoreUrl}/checkout/order-confirmation/${createdOrderId}?t=${token}`);
        logs.push(`Confirmation URL created with pattern: {store_url}/checkout/order-confirmation/{order_id}?t={checkout_token}`);
      } else {
        logs.push("Warning: Unable to generate confirmation URL because order ID is missing");
      }
      logs.push("Payment middleware flow completed successfully");
      
      setDebugInfo(logs);
    } catch (err) {
      console.error("Error processing payment:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setDebugInfo(prev => [...prev, `Error: ${err instanceof Error ? err.message : "An unknown error occurred"}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (confirmationUrl) {
      navigator.clipboard.writeText(confirmationUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-lg font-medium mb-4">
          External Payment Middleware Demo
        </h2>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="mb-4 text-sm text-neutral-600">
              This simulates the payment middleware flow where an external payment processor
              converts a checkout to an order and updates the payment status.
            </p>
            
            <h3 className="font-medium mb-2">Checkout Information</h3>
            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div>
                <strong>Checkout ID:</strong> {checkoutData.data.id}
              </div>
              <div>
                <strong>Grand Total:</strong> ${checkoutData.data.grand_total.toFixed(2)}
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., ExternalPayment" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paymentProviderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Provider ID (Transaction ID)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., transaction_123456789" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="statusId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select order status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ORDER_STATUSES.map((status) => (
                            <SelectItem 
                              key={status.id} 
                              value={status.id.toString()}
                            >
                              {status.name} (ID: {status.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Place Order"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {confirmationUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="font-medium text-green-800">Order Successfully Created</h3>
            </div>
            <p className="text-sm text-green-700 mb-3">
              The order has been created and the payment status updated successfully.
              Below is the confirmation URL that would be used to redirect the customer:
            </p>
            <div className="flex items-center">
              <Input 
                value={confirmationUrl} 
                readOnly 
                className="mr-2 bg-white border-green-300"
              />
              <Button 
                size="sm" 
                variant="outline" 
                onClick={copyToClipboard}
                className="flex items-center"
              >
                <ClipboardCopy className="h-4 w-4 mr-1" />
                {isCopied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        )}
        
        {debugInfo.length > 0 && (
          <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-medium mb-2">Debug Information</h3>
            <div className="bg-black text-green-400 p-3 rounded text-xs font-mono overflow-auto max-h-60">
              {debugInfo.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}