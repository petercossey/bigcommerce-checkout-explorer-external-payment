import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { fetchCheckout } from "../lib/api";
import { Checkout } from "../types/checkout";

const formSchema = z.object({
  checkoutId: z.string().trim().uuid({ message: "Must be a valid UUID" })
});

type FormData = z.infer<typeof formSchema>;

interface CheckoutFetcherProps {
  isApiConnected: boolean;
  storeHash: string;
  accessToken: string;
  onCheckoutFetched: (checkoutData: Checkout | null) => void;
  onError: (message: string) => void;
}

export default function CheckoutFetcher({
  isApiConnected,
  storeHash,
  accessToken,
  onCheckoutFetched,
  onError
}: CheckoutFetcherProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkoutId: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    if (!isApiConnected) {
      onError("API connection must be configured before fetching checkout data.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const checkoutData = await fetchCheckout(storeHash, accessToken, data.checkoutId);
      onCheckoutFetched(checkoutData);
    } catch (error) {
      onError(`Failed to fetch checkout data: ${error instanceof Error ? error.message : String(error)}`);
      onCheckoutFetched(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-md border border-neutral-200">
      <CardContent className="p-6">
        <CardTitle className="text-lg font-semibold text-[#1E3050] mb-4">
          Fetch Checkout Data
        </CardTitle>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="checkoutId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-500">
                    Checkout UUID
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 306d57d7-124e-4112-82cd-35e060c0d4d9"
                      className="bg-neutral-50"
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex flex-wrap gap-3 items-center">
              <Button
                type="submit"
                className="bg-[#34B3E4] hover:bg-[#188FBD] text-white"
                disabled={isLoading || !isApiConnected}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Fetching..." : "Fetch Checkout Data"}
              </Button>
              
              {!isApiConnected && (
                <span className="text-sm text-neutral-500">
                  Configure API connection first
                </span>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
