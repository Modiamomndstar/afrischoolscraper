import { trpc } from "@/providers/trpc";
import { 
  Globe, 
  ExternalLink, 
  Plus, 
  ShieldCheck, 
  ShieldAlert,
  Database,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function DataSources() {
  const { data: sources, isLoading, refetch } = trpc.source.list.useQuery();
  const seedMutation = trpc.scraper.seedSources.useMutation({
    onSuccess: () => {
      toast.success("Default sources seeded!");
      refetch();
    }
  });

  const getReliabilityBadge = (score: number) => {
    if (score >= 8) return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">High Reliability</Badge>;
    if (score >= 5) return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Medium Reliability</Badge>;
    return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Low Reliability</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold text-[#E8ECF1]">Data Sources</h2>
          <p className="text-[14px] text-[#5A6478]">Manage websites and portals used for school data collection.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="border-[#2A3142] text-[#8B95A8] hover:text-[#E8ECF1]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${seedMutation.isPending ? 'animate-spin' : ''}`} />
            Seed Defaults
          </Button>
          <Button className="bg-[#00C9A7] text-[#0B0E13] hover:bg-[#00A88A]">
            <Plus className="w-4 h-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#5A6478]">Loading sources...</div>
      ) : sources?.length === 0 ? (
        <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-12 text-center">
          <Database className="w-12 h-12 mx-auto mb-4 text-[#3A4560]" />
          <h3 className="text-[18px] font-semibold text-[#E8ECF1] mb-2">No data sources yet</h3>
          <p className="text-[#5A6478] mb-6">Start by adding a source or seeding the default African education portals.</p>
          <Button onClick={() => seedMutation.mutate()} className="bg-[#00C9A7] text-[#0B0E13]">
            Seed Default Sources
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources?.map((source) => (
            <div key={source.id} className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-5 hover:border-[#00C9A7]/50 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-[#1A1F2E] rounded-lg">
                  <Globe className="w-5 h-5 text-[#00C9A7]" />
                </div>
                {getReliabilityBadge(source.reliability ?? 5)}
              </div>
              
              <h4 className="text-[16px] font-semibold text-[#E8ECF1] mb-1 group-hover:text-[#00C9A7] transition-colors line-clamp-1">
                {source.name}
              </h4>
              <p className="text-[12px] text-[#5A6478] mb-4 truncate">{source.url}</p>
              
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1 text-[12px] text-[#8B95A8]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                  {source.country || "General"}
                </div>
                <div className="w-1 h-1 bg-[#2A3142] rounded-full" />
                <div className="text-[12px] text-[#8B95A8] capitalize">
                  {source.category || "Mixed"}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#2A3142]">
                <div className="text-[11px] text-[#5A6478]">
                  Last scraped: {source.lastScraped ? new Date(source.lastScraped).toLocaleDateString() : "Never"}
                </div>
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#00C9A7] hover:underline flex items-center gap-1 text-[12px]"
                >
                  Visit <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
