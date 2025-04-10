import { ShoppingCart } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
}

export default function Header({ isConnected }: HeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingCart className="text-[#1E3050]" />
          <h1 className="text-xl font-semibold text-[#1E3050]">
            BigCommerce Checkout Explorer
          </h1>
        </div>
        
        <div className="hidden md:flex items-center text-sm">
          {isConnected ? (
            <span className="flex items-center text-[#00AB6C]">
              <span className="w-2 h-2 rounded-full bg-[#00AB6C] mr-2"></span>
              Connected to API
            </span>
          ) : (
            <span className="flex items-center text-neutral-500">
              <span className="w-2 h-2 rounded-full bg-neutral-400 mr-2"></span>
              Not connected
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
