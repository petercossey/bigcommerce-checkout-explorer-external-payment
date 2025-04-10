import { ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 py-4 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-neutral-500">
            BigCommerce Checkout Explorer | For Developer Use
          </div>
          <div className="mt-2 md:mt-0 text-sm text-neutral-400">
            <a
              href="https://developer.bigcommerce.com/docs/rest-management/checkouts"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#34B3E4] hover:text-[#188FBD] inline-flex items-center"
            >
              <span>API Documentation</span>
              <ExternalLink className="ml-1 text-xs" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
