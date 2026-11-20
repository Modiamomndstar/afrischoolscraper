import { Link } from "react-router";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0B0E13]">
      <div className="text-center">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-[#F59E0B]" />
        <h1 className="text-[48px] font-bold text-[#E8ECF1] mb-2">404</h1>
        <p className="text-[16px] text-[#8B95A8] mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/">
          <Button className="bg-[#00C9A7] text-[#0B0E13] hover:bg-[#00A88A]">
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
