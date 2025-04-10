import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkout } from "../types/checkout";

interface RawJsonTabProps {
  checkoutData: Checkout;
}

export default function RawJsonTab({ checkoutData }: RawJsonTabProps) {
  const [copied, setCopied] = useState(false);
  
  const jsonString = JSON.stringify(checkoutData, null, 2);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-neutral-700">Raw JSON Response</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="text-sm text-[#34B3E4] hover:text-[#188FBD] hover:bg-transparent"
        >
          {copied ? (
            <>
              <Check className="mr-1 h-4 w-4" /> Copied!
            </>
          ) : (
            <>
              <Copy className="mr-1 h-4 w-4" /> Copy to Clipboard
            </>
          )}
        </Button>
      </div>
      
      <div className="border border-neutral-200 rounded-lg bg-neutral-50 p-4 overflow-auto max-h-[600px]">
        <pre className="text-xs font-mono whitespace-pre-wrap break-words text-neutral-800">
          {jsonString}
        </pre>
      </div>
    </div>
  );
}
