import { useState, useCallback } from "react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { Link } from "react-router";
import {
  Phone,
  Mail,
  Globe,
  ChevronLeft,
  ChevronRight,
  Filter,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const CATEGORY_COLORS: Record<string, string> = {
  primary: "bg-[rgba(0,201,167,0.15)] text-[#00C9A7] border-[#00C9A7]/30",
  secondary: "bg-[rgba(99,102,241,0.15)] text-[#6366F1] border-[#6366F1]/30",
  tertiary: "bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border-[#F59E0B]/30",
  vocational: "bg-[rgba(59,130,246,0.15)] text-[#3B82F6] border-[#3B82F6]/30",
  special_needs: "bg-[rgba(239,68,68,0.15)] text-[#EF4444] border-[#EF4444]/30",
};

const TYPE_COLORS: Record<string, string> = {
  public: "text-[#3B82F6]",
  private: "text-[#F59E0B]",
  faith_based: "text-[#6366F1]",
  community: "text-[#22C55E]",
};

interface Filters {
  countries: string[];
  states: string[];
  lgas: string[];
  categories: string[];
  types: string[];
  hasContact: boolean;
}

export default function Schools() {
  const [page, setPage] = useState(1);
  const [search] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    countries: [],
    states: [],
    lgas: [],
    categories: [],
    types: [],
    hasContact: false,
  });

  const { data: schoolsData, isLoading } = trpc.school.list.useQuery({
    page,
    limit: 25,
    search: search || undefined,
    countries: filters.countries.length > 0 ? filters.countries : undefined,
    states: filters.states.length > 0 ? filters.states : undefined,
    lgas: filters.lgas.length > 0 ? filters.lgas : undefined,
    categories: filters.categories.length > 0 ? filters.categories : undefined,
    types: filters.types.length > 0 ? filters.types : undefined,
    hasContact: filters.hasContact || undefined,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const { data: filterOptions } = trpc.school.getFilters.useQuery();

  const utils = trpc.useUtils();

  const handleExport = useCallback(async () => {
    try {
      const result = await utils.client.school.exportCSV.query({
        countries: filters.countries.length > 0 ? filters.countries : undefined,
        states: filters.states.length > 0 ? filters.states : undefined,
        categories: filters.categories.length > 0 ? filters.categories : undefined,
        types: filters.types.length > 0 ? filters.types : undefined,
        hasContact: filters.hasContact || undefined,
      });

      const blob = new Blob([result], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `afrischools-export-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CSV exported successfully!");
    } catch (err) {
      toast.error("Export failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }, [filters, utils]);

  const toggleFilter = (category: keyof Filters, value: string) => {
    setFilters((prev) => {
      const current = prev[category] as string[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      countries: [],
      states: [],
      lgas: [],
      categories: [],
      types: [],
      hasContact: false,
    });
    setPage(1);
  };

  const activeFilterCount =
    filters.countries.length +
    filters.states.length +
    filters.lgas.length +
    filters.categories.length +
    filters.types.length +
    (filters.hasContact ? 1 : 0);

  return (
    <div className="flex h-full gap-4">
      {/* Filter Panel */}
      {showFilters && (
        <div className="w-[280px] flex-shrink-0 bg-[#11151F] border border-[#2A3142] rounded-[10px] p-5 space-y-5 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-[#E8ECF1]">Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-[11px] text-[#00C9A7] hover:underline"
              >
                Clear all ({activeFilterCount})
              </button>
            )}
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478] mb-2 block">
              Country
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {filterOptions?.countries.map((country) => (
                <label key={country} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.countries.includes(country)}
                    onCheckedChange={() => toggleFilter("countries", country)}
                    className="border-[#3A4560] data-[state=checked]:bg-[#00C9A7] data-[state=checked]:border-[#00C9A7]"
                  />
                  <span className="text-[13px] text-[#8B95A8]">{country}</span>
                </label>
              )) ?? (
                <div className="text-[12px] text-[#5A6478]">Loading...</div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478] mb-2 block">
              Category
            </label>
            <div className="space-y-1.5">
              {["primary", "secondary", "tertiary", "vocational", "special_needs"].map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.categories.includes(cat)}
                    onCheckedChange={() => toggleFilter("categories", cat)}
                    className="border-[#3A4560] data-[state=checked]:bg-[#00C9A7] data-[state=checked]:border-[#00C9A7]"
                  />
                  <span className="text-[13px] text-[#8B95A8] capitalize">
                    {cat.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478] mb-2 block">
              Type
            </label>
            <div className="space-y-1.5">
              {["public", "private", "faith_based", "community"].map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={filters.types.includes(type)}
                    onCheckedChange={() => toggleFilter("types", type)}
                    className="border-[#3A4560] data-[state=checked]:bg-[#00C9A7] data-[state=checked]:border-[#00C9A7]"
                  />
                  <span className="text-[13px] text-[#8B95A8] capitalize">
                    {type.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={filters.hasContact}
                onCheckedChange={(checked) => {
                  setFilters((prev) => ({ ...prev, hasContact: checked === true }));
                  setPage(1);
                }}
                className="border-[#3A4560] data-[state=checked]:bg-[#00C9A7] data-[state=checked]:border-[#00C9A7]"
              />
              <span className="text-[13px] text-[#8B95A8]">Has contact info</span>
            </label>
          </div>
        </div>
      )}

      {/* Main Table Area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 px-3 text-[#8B95A8] border border-[#2A3142] hover:border-[#00C9A7] hover:text-[#00C9A7]"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
            <span className="text-[13px] text-[#5A6478]">
              {schoolsData?.total ?? 0} results
            </span>
          </div>
          <Button
            onClick={handleExport}
            size="sm"
            className="h-9 px-4 bg-[#00C9A7] text-[#0B0E13] hover:bg-[#00A88A]"
          >
            Export CSV
          </Button>
        </div>

        {/* Table */}
        <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-[1fr_100px_80px_140px_100px_60px] gap-0 bg-[#1A1F2E] border-b border-[#2A3142]">
            {["School Name", "Category", "Type", "Location", "Contact", ""].map((header) => (
              <div
                key={header}
                className="px-4 py-3 text-[11px] font-medium uppercase tracking-widest text-[#5A6478]"
              >
                {header}
              </div>
            ))}
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-[#5A6478]">Loading...</div>
          ) : schoolsData?.schools.length === 0 ? (
            <div className="p-8 text-center text-[#5A6478]">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-[#3A4560]" />
              <p className="text-[16px] font-semibold text-[#E8ECF1] mb-1">
                No schools found
              </p>
              <p className="text-[13px]">
                Try adjusting your filters or start a scraper job to collect data.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#2A3142]/50">
              {schoolsData?.schools.map((school) => (
                <Link
                  key={school.id}
                  to={`/schools/${school.id}`}
                  className="grid grid-cols-[1fr_100px_80px_140px_100px_60px] gap-0 items-center hover:bg-[rgba(0,201,167,0.04)] transition-colors group"
                >
                  <div className="px-4 py-3">
                    <div className="text-[13px] font-medium text-[#E8ECF1] group-hover:text-[#00C9A7] truncate">
                      {school.name}
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-medium capitalize ${
                        CATEGORY_COLORS[school.category] ?? ""
                      }`}
                    >
                      {school.category.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div className="px-4 py-3">
                    <span
                      className={`text-[13px] capitalize ${
                        TYPE_COLORS[school.type] ?? "text-[#8B95A8]"
                      }`}
                    >
                      {school.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="px-4 py-3">
                    <div className="text-[13px] text-[#8B95A8] truncate">
                      {school.city ?? school.lga ?? school.state}
                    </div>
                    <div className="text-[11px] text-[#5A6478]">{school.country}</div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {school.phone && <Phone className="w-3.5 h-3.5 text-[#22C55E]" />}
                      {school.email && <Mail className="w-3.5 h-3.5 text-[#3B82F6]" />}
                      {school.website && <Globe className="w-3.5 h-3.5 text-[#6366F1]" />}
                      {!school.phone && !school.email && !school.website && (
                        <span className="text-[11px] text-[#5A6478]">—</span>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <ChevronRight className="w-4 h-4 text-[#5A6478] group-hover:text-[#00C9A7]" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {schoolsData && schoolsData.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#2A3142]">
              <span className="text-[13px] text-[#5A6478]">
                Showing {(schoolsData.page - 1) * 25 + 1}-
                {Math.min(schoolsData.page * 25, schoolsData.total)} of {schoolsData.total}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0 text-[#8B95A8] border border-[#2A3142] disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(5, schoolsData.totalPages) }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <Button
                      key={pageNum}
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={`h-8 w-8 p-0 text-[13px] ${
                        page === pageNum
                          ? "bg-[#00C9A7] text-[#0B0E13]"
                          : "text-[#8B95A8] border border-[#2A3142]"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  )
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(schoolsData.totalPages, p + 1))}
                  disabled={page === schoolsData.totalPages}
                  className="h-8 w-8 p-0 text-[#8B95A8] border border-[#2A3142] disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
