import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ApiConfigForm from "./ApiConfigForm";
import CheckoutFetcher from "./CheckoutFetcher";
import ResultsDisplay from "./ResultsDisplay";
import ErrorDisplay from "./ErrorDisplay";
import { Checkout } from "../types/checkout";

export default function CheckoutExplorer() {
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [checkoutData, setCheckoutData] = useState<Checkout | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storeHash, setStoreHash] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");

  const handleApiCredentialsUpdate = (storeHash: string, accessToken: string) => {
    setStoreHash(storeHash);
    setAccessToken(accessToken);
    setIsApiConnected(true);
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
  };

  const dismissError = () => {
    setErrorMessage(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8F9] text-[#2D3436]">
      <Header isConnected={isApiConnected} />
      
      <main className="flex-grow container mx-auto px-4 py-6 flex flex-col space-y-6">
        <ApiConfigForm 
          onApiConnected={handleApiCredentialsUpdate} 
          onError={handleError}
        />
        
        <CheckoutFetcher 
          isApiConnected={isApiConnected}
          storeHash={storeHash}
          accessToken={accessToken}
          onCheckoutFetched={setCheckoutData}
          onError={handleError}
        />
        
        {errorMessage && (
          <ErrorDisplay 
            message={errorMessage} 
            onDismiss={dismissError} 
          />
        )}
        
        {checkoutData && (
          <ResultsDisplay checkoutData={checkoutData} />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
