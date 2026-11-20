import { useLocation } from "react-router";
import { Link } from "react-router";
import {
  LayoutDashboard,
  Building2,
  Bot,
  BarChart3,
  Settings,
  Grid3X3,
  Download,
  Search,
  Bell,
  Globe,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/schools", label: "Schools Database", icon: Building2 },
  { path: "/scraper", label: "Scraper Engine", icon: Bot },
  { path: "/sources", label: "Data Sources", icon: Globe },
  { path: "/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/settings", label: "Settings", icon: Settings },

];

interface AppLayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  onExport?: () => void;
}

export default function AppLayout({ children, onSearch, onExport }: AppLayoutProps) {
  const location = useLocation();
  const [searchValue, setSearchValue] = useState("");

  const currentNav = navItems.find((item) => item.path === location.pathname);
  const pageTitle = currentNav?.label ?? "AfriSchools";
  const pageSubtitle = getPageSubtitle(location.pathname);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0E13]">
      {/* Sidebar */}
      <aside className="w-[240px] flex-shrink-0 bg-[#11151F] border-r border-[#2A3142] flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-[#2A3142]">
          <Grid3X3 className="w-4 h-4 text-[#00C9A7] mr-2" />
          <span className="text-[20px] font-semibold text-[#E8ECF1] tracking-tight">
            AfriSchools
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center h-10 px-4 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[rgba(0,201,167,0.08)] text-[#00C9A7] border-l-[3px] border-l-[#00C9A7]"
                    : "text-[#8B95A8] hover:bg-[#1A1F2E]"
                }`}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom status */}
        <div className="p-4 border-t border-[#2A3142]">
          <div className="bg-[#1A1F2E] rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#22C55E] pulse-dot" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#5A6478]">
                Scraper: Ready
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex-shrink-0 bg-[#11151F] border-b border-[#2A3142] flex items-center justify-between px-6">
          <div>
            <h1 className="text-[20px] font-semibold text-[#E8ECF1] tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478]">
              {pageSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6478]" />
                <Input
                  type="text"
                  placeholder="Search schools..."
                  value={searchValue}
                  onChange={handleSearch}
                  className="w-[320px] h-10 pl-9 bg-[#0B0E13] border-[#3A4560] text-[#E8ECF1] placeholder:text-[#5A6478] focus:border-[#00C9A7] focus:ring-[#00C9A7]/15"
                />
              </div>
            )}
            {onExport && (
              <Button
                onClick={onExport}
                className="h-10 px-5 bg-[#00C9A7] text-[#0B0E13] hover:bg-[#00A88A] font-medium text-sm rounded-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
            <button className="w-10 h-10 flex items-center justify-center text-[#8B95A8] hover:text-[#E8ECF1] transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function getPageSubtitle(path: string): string {
  switch (path) {
    case "/":
      return "Overview & Analytics";
    case "/schools":
      return "Browse & Manage School Records";
    case "/scraper":
      return "AI-Powered Data Collection";
    case "/analytics":
      return "Data Insights & Reports";
    case "/settings":
      return "Configuration & Preferences";
    case "/sources":
      return "Data Source Management";

    default:
      return "";
  }
}
