import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { getCookie, setCookie, eraseCookie } from "../lib/cookies";
import { validateCredentials } from "../lib/api";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  storeHash: z.string().min(1, { message: "Store Hash is required" }),
  accessToken: z.string().min(1, { message: "Access Token is required" }),
  rememberCredentials: z.boolean().optional()
});

type FormData = z.infer<typeof formSchema>;

interface ApiConfigFormProps {
  onApiConnected: (storeHash: string, accessToken: string) => void;
  onError: (message: string) => void;
}

const COOKIE_STORE_HASH = "bc_store_hash";
const COOKIE_ACCESS_TOKEN = "bc_access_token";
const COOKIE_EXPIRY_DAYS = 1; // Reduced to 1 day for security

export default function ApiConfigForm({ onApiConnected, onError }: ApiConfigFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeHash: "",
      accessToken: "",
      rememberCredentials: false
    }
  });

  // Load saved credentials on initial render
  useEffect(() => {
    const storeHash = getCookie(COOKIE_STORE_HASH);
    const accessToken = getCookie(COOKIE_ACCESS_TOKEN);
    
    if (storeHash && accessToken) {
      form.setValue("storeHash", storeHash);
      form.setValue("accessToken", accessToken);
      form.setValue("rememberCredentials", true);
      onApiConnected(storeHash, accessToken);
    }
  }, []);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const clearCredentials = () => {
    form.reset({
      storeHash: "",
      accessToken: "",
      rememberCredentials: false
    });
    eraseCookie(COOKIE_STORE_HASH);
    eraseCookie(COOKIE_ACCESS_TOKEN);
    toast({
      title: "Credentials cleared",
      description: "API credentials have been removed from cookies.",
      duration: 3000
    });
  };
  
  const onSubmit = async (data: FormData) => {
    setIsValidating(true);
    try {
      const isValid = await validateCredentials(data.storeHash, data.accessToken);
      
      if (isValid) {
        if (data.rememberCredentials) {
          setCookie(COOKIE_STORE_HASH, data.storeHash, COOKIE_EXPIRY_DAYS);
          setCookie(COOKIE_ACCESS_TOKEN, data.accessToken, COOKIE_EXPIRY_DAYS);
        }
        
        onApiConnected(data.storeHash, data.accessToken);
        
        toast({
          title: "Connected successfully",
          description: "API connection configured successfully!",
          duration: 3000
        });
      } else {
        onError("Invalid credentials. Unable to connect to BigCommerce API.");
      }
    } catch (error) {
      onError(`API connection error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsValidating(false);
    }
  };
  
  return (
    <Card className="bg-white shadow-md border border-neutral-200">
      <CardContent className="p-6">
        <CardTitle className="text-lg font-semibold text-[#1E3050] mb-4">
          API Configuration
        </CardTitle>
        <p className="text-sm text-neutral-600 mb-4">
          Required API scopes: store_v2_orders, store_v3_checkouts, store_catalog_read_only
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="storeHash"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-500">Store Hash</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your store hash"
                        className="bg-neutral-50"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="accessToken"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel className="text-neutral-500">API Access Token</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your API token"
                          className="bg-neutral-50 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? 
                            <EyeOff className="h-4 w-4 text-neutral-400" /> : 
                            <Eye className="h-4 w-4 text-neutral-400" />
                          }
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <FormField
                control={form.control}
                name="rememberCredentials"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="rememberCredentials"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <Label
                        htmlFor="rememberCredentials"
                        className="text-sm text-neutral-600 cursor-pointer"
                      >
                        Remember credentials (saved in browser cookies)
                      </Label>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                type="submit" 
                className="bg-[#1E3050] hover:bg-[#101C36] text-white"
                disabled={isValidating}
              >
                <Plug className="mr-2 h-4 w-4" />
                {isValidating ? "Connecting..." : "Connect to API"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="border-neutral-300 text-neutral-700"
                onClick={clearCredentials}
              >
                Clear Credentials
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
