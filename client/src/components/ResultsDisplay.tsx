import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SummaryTab from "./SummaryTab";
import DetailsTab from "./DetailsTab";
import RawJsonTab from "./RawJsonTab";
import ExternalPaymentTab from "./ExternalPaymentTab";
import { Checkout } from "../types/checkout";

interface ResultsDisplayProps {
  checkoutData: Checkout;
  storeHash?: string;
  accessToken?: string;
  storeUrl?: string;
}

export default function ResultsDisplay({ 
  checkoutData, 
  storeHash = "", 
  accessToken = "", 
  storeUrl = "" 
}: ResultsDisplayProps) {
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div>
      <Card className="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden">
        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-neutral-200">
            <TabsList className="bg-transparent border-b-0">
              <TabsTrigger
                value="summary"
                className="px-6 py-3 data-[state=active]:text-[#34B3E4] data-[state=active]:border-b-2 data-[state=active]:border-[#34B3E4] data-[state=inactive]:text-neutral-500 font-medium text-sm"
              >
                Summary
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="px-6 py-3 data-[state=active]:text-[#34B3E4] data-[state=active]:border-b-2 data-[state=active]:border-[#34B3E4] data-[state=inactive]:text-neutral-500 font-medium text-sm"
              >
                Full Details
              </TabsTrigger>
              <TabsTrigger
                value="external-payment"
                className="px-6 py-3 data-[state=active]:text-[#34B3E4] data-[state=active]:border-b-2 data-[state=active]:border-[#34B3E4] data-[state=inactive]:text-neutral-500 font-medium text-sm"
              >
                External Payment
              </TabsTrigger>
              <TabsTrigger
                value="json"
                className="px-6 py-3 data-[state=active]:text-[#34B3E4] data-[state=active]:border-b-2 data-[state=active]:border-[#34B3E4] data-[state=inactive]:text-neutral-500 font-medium text-sm"
              >
                Raw JSON
              </TabsTrigger>
            </TabsList>
          </div>
          
          <CardContent className="p-0">
            <TabsContent value="summary" className="p-6 m-0">
              <SummaryTab checkoutData={checkoutData} />
            </TabsContent>
            
            <TabsContent value="details" className="p-6 m-0">
              <DetailsTab checkoutData={checkoutData} />
            </TabsContent>
            
            <TabsContent value="external-payment" className="p-6 m-0">
              <ExternalPaymentTab 
                checkoutData={checkoutData} 
                storeHash={storeHash}
                accessToken={accessToken}
                storeUrl={storeUrl}
              />
            </TabsContent>
            
            <TabsContent value="json" className="p-6 m-0">
              <RawJsonTab checkoutData={checkoutData} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
