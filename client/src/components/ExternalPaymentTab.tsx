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
import { convertCheckoutToOrder, updateOrderStatus } from "../lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClipboardCopy, CheckCircle2, AlertCircle } from "lucide-react";

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
}

export default function ExternalPaymentTab({
  checkoutData,
  storeHash,
  accessToken,
}: ExternalPaymentTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationUrl, setConfirmationUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: "",
      paymentProviderId: "",
      statusId: "11", // Default to "Awaiting Fulfillment"
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setConfirmationUrl(null);

    try {
      const checkoutId = checkoutData.data.id;

      // Step 1: Generate checkout token
      const tokenResponse = await fetch(`/api/bigcommerce/checkout-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storeHash, accessToken, checkoutId }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to generate checkout token");
      }
      
      const { token } = await tokenResponse.json();

      // Step 2: Convert checkout to order
      const orderResponse = await convertCheckoutToOrder(
        storeHash,
        accessToken,
        checkoutId
      );

      const orderId = orderResponse.data.id;

      // Step 3: Update order with payment information
      await updateOrderStatus(
        storeHash, 
        accessToken, 
        orderId, 
        {
          payment_method: data.paymentMethod,
          payment_provider_id: data.paymentProviderId,
          status_id: parseInt(data.statusId)
        }
      );

      // Step 4: Set confirmation URL
      setConfirmationUrl(`/checkout/order-confirmation/${orderId}?t=${token}`);
    } catch (err) {
      console.error("Error processing payment:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
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
      </div>
    </div>
  );
}