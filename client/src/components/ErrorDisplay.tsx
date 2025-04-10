import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ErrorDisplayProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorDisplay({ message, onDismiss }: ErrorDisplayProps) {
  return (
    <Alert variant="destructive" className="bg-red-50 border border-red-200 text-red-800">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <div className="ml-3 flex-1">
          <AlertTitle className="text-sm font-medium text-red-800">Error</AlertTitle>
          <AlertDescription className="mt-2 text-sm text-red-700">
            {message}
          </AlertDescription>
          <div className="mt-4">
            <Button
              variant="link"
              size="sm"
              onClick={onDismiss}
              className="text-sm text-red-700 hover:text-red-500 p-0 h-auto"
            >
              Dismiss
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full p-0 text-red-500 hover:bg-red-100"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
