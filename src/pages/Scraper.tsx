import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import {
  Play,
  Square,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa",
  "Uganda", "Tanzania", "Ethiopia", "Rwanda",
];

const CATEGORIES = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "tertiary", label: "Tertiary" },
  { value: "vocational", label: "Vocational" },
  { value: "special_needs", label: "Special Needs" },
];

export default function Scraper() {
  const [query, setQuery] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["Nigeria"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["secondary", "primary", "tertiary"]);
  const [expandedJob, setExpandedJob] = useState<number | null>(null);
  const [maxResults, setMaxResults] = useState(50);
  const [aiProvider, setAiProvider] = useState<"gemini" | "openrouter">("gemini");
  const [aiModel, setAiModel] = useState("gemini-1.5-flash");


  const handleProviderChange = (p: "gemini" | "openrouter") => {
    setAiProvider(p);
    if (p === "gemini") {
      setAiModel("gemini-1.5-flash");
    } else {
      setAiModel("meta-llama/llama-3-8b-instruct:free");
    }
  };



  const utils = trpc.useUtils();
  const { data: jobsData, isLoading: jobsLoading } =
    trpc.scraper.getJobs.useQuery({ page: 1, limit: 20 });

  const startScrape = trpc.scraper.start.useMutation({
    onSuccess: (data) => {
      toast.success(`Scraping job #${data.jobId} started!`, {
        description: "Your data is being collected in the background.",
      });
      utils.scraper.getJobs.invalidate();
      utils.school.getStats.invalidate();
    },
    onError: (err) => {
      toast.error("Failed to start scraper", {
        description: err.message,
      });
    },
  });

  const stopJob = trpc.scraper.stopJob.useMutation({
    onSuccess: () => {
      toast.info("Job stopped");
      utils.scraper.getJobs.invalidate();
    },
  });

  const handleStart = () => {
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    if (selectedCountries.length === 0) {
      toast.error("Please select at least one country");
      return;
    }
    startScrape.mutate({
      query: query.trim(),
      targetCountries: selectedCountries,
      targetCategories: selectedCategories,
      maxResults,
      aiProvider,
      aiModel,
    });

  };

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return (
          <Badge className="bg-[rgba(59,130,246,0.15)] text-[#3B82F6] border-[#3B82F6]/30">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Running
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-[rgba(34,197,94,0.15)] text-[#22C55E] border-[#22C55E]/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-[rgba(239,68,68,0.15)] text-[#EF4444] border-[#EF4444]/30">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case "stopped":
        return (
          <Badge className="bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border-[#F59E0B]/30">
            <Square className="w-3 h-3 mr-1" />
            Stopped
          </Badge>
        );
      default:
        return (
          <Badge className="bg-[rgba(139,149,168,0.15)] text-[#8B95A8] border-[#8B95A8]/30">
            <Clock className="w-3 h-3 mr-1" />
            Queued
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-5 h-5 text-[#00C9A7]" />
          <h2 className="text-[20px] font-semibold text-[#E8ECF1]">
            AI-Powered Scraper
          </h2>
        </div>

        <div className="space-y-5">
          {/* Query Input */}
          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478] mb-2 block">
              Search Query or Target URL
            </label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., secondary schools in Osun State, or https://example-schools-directory.com"
              className="flex-1 min-h-[80px] bg-[#0B0E13] border-[#3A4560] text-[#E8ECF1] placeholder:text-[#5A6478] focus:border-[#00C9A7] focus:ring-[#00C9A7]/15 resize-none"
            />
            <p className="text-[12px] text-[#5A6478] mt-1.5">
              Enter search terms or a specific website URL to scrape school data from.
            </p>
          </div>

          {/* Target Countries */}
          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478] mb-2 block">
              Target Countries
            </label>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((country) => (
                <button
                  key={country}
                  onClick={() => toggleCountry(country)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all border ${
                    selectedCountries.includes(country)
                      ? "bg-[rgba(0,201,167,0.08)] text-[#00C9A7] border-[#00C9A7]/30"
                      : "bg-[#0B0E13] text-[#8B95A8] border-[#2A3142] hover:border-[#3A4560]"
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          {/* School Categories */}
          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478] mb-2 block">
              School Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => toggleCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all border ${
                    selectedCategories.includes(cat.value)
                      ? "bg-[rgba(0,201,167,0.08)] text-[#00C9A7] border-[#00C9A7]/30"
                      : "bg-[#0B0E13] text-[#8B95A8] border-[#2A3142] hover:border-[#3A4560]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Model Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478] mb-2 block">
                AI Provider
              </label>
              <div className="flex gap-2">
                {["gemini", "openrouter"].map((p) => (
                  <button
                    key={p}
                    onClick={() => handleProviderChange(p as any)}

                    className={`flex-1 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all border ${
                      aiProvider === p
                        ? "bg-[rgba(0,201,167,0.08)] text-[#00C9A7] border-[#00C9A7]/30"
                        : "bg-[#0B0E13] text-[#8B95A8] border-[#2A3142] hover:border-[#3A4560]"
                    }`}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478] mb-2 block">
                AI Model
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-[13px] font-medium bg-[#0B0E13] text-[#E8ECF1] border border-[#2A3142] focus:border-[#00C9A7] outline-none"
              >
                {aiProvider === "gemini" ? (
                  <>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Powerful)</option>
                  </>
                ) : (
                  <>
                    <option value="meta-llama/llama-3-8b-instruct:free">Llama 3 8B (Free)</option>
                    <option value="mistralai/mistral-7b-instruct:free">Mistral 7B (Free)</option>
                    <option value="google/gemma-7b-it:free">Gemma 7B (Free)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Max Results */}
          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478] mb-2 block">
              Maximum Results: {maxResults}
            </label>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="w-full h-1.5 bg-[#1A1F2E] rounded-full appearance-none cursor-pointer"
              style={{ accentColor: '#00C9A7' }}
            />
            <div className="flex justify-between text-[11px] text-[#5A6478] mt-1">
              <span>10</span>
              <span>500</span>
            </div>
          </div>


          {/* Start Button */}
          <Button
            onClick={handleStart}
            disabled={startScrape.isPending}
            className="w-full h-12 bg-[#00C9A7] text-[#0B0E13] hover:bg-[#00A88A] font-semibold text-[15px] rounded-lg disabled:opacity-40"
          >
            {startScrape.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Starting Scraping Job...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start Scraping
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Job Queue */}
      <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-semibold text-[#E8ECF1]">
            Job Queue
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => utils.scraper.getJobs.invalidate()}
            className="h-8 px-2 text-[#8B95A8] hover:text-[#00C9A7]"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>

        {jobsLoading ? (
          <div className="text-center py-8 text-[#5A6478]">Loading jobs...</div>
        ) : jobsData?.jobs.length === 0 ? (
          <div className="text-center py-8">
            <Terminal className="w-12 h-12 mx-auto mb-3 text-[#3A4560]" />
            <p className="text-[16px] font-semibold text-[#E8ECF1] mb-1">
              No scraping jobs yet
            </p>
            <p className="text-[13px] text-[#5A6478]">
              Configure and start your first scraping job above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobsData?.jobs.map((job) => (
              <div
                key={job.id}
                className="bg-[#0B0E13] border border-[#2A3142] rounded-lg overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(job.status)}
                      <span className="text-[14px] font-medium text-[#E8ECF1]">
                        {job.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.status === "running" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => stopJob.mutate({ id: job.id })}
                          className="h-7 px-2 text-[#EF4444] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)]"
                        >
                          <Square className="w-3.5 h-3.5 mr-1" />
                          Stop
                        </Button>
                      )}
                      <button
                        onClick={() =>
                          setExpandedJob(
                            expandedJob === job.id ? null : job.id
                          )
                        }
                        className="h-7 w-7 flex items-center justify-center text-[#5A6478] hover:text-[#E8ECF1]"
                      >
                        {expandedJob === job.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  {job.status === "running" && (
                    <div className="mb-3">
                      <Progress
                        value={job.progress}
                        className="h-1.5 bg-[#1A1F2E] [&>div]:bg-[#00C9A7]"
                      />
                      <span className="text-[11px] text-[#5A6478] mt-1">
                        {job.progress}%
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-6 text-[12px] text-[#5A6478]">
                    <span>
                      Found: <span className="text-[#E8ECF1]">{job.schoolsFound}</span>
                    </span>
                    <span>
                      Added:{" "}
                      <span className="text-[#00C9A7]">{job.schoolsAdded}</span>
                    </span>
                    <span>
                      {job.status === "completed" && job.completedAt
                        ? `Completed: ${new Date(job.completedAt).toLocaleString()}`
                        : job.startedAt
                          ? `Started: ${new Date(job.startedAt).toLocaleString()}`
                          : "Queued"}
                    </span>
                  </div>

                  {job.errorMessage && (
                    <div className="mt-2 text-[12px] text-[#EF4444]">
                      Error: {job.errorMessage}
                    </div>
                  )}
                </div>

                {expandedJob === job.id && <JobLogs jobId={job.id} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobLogs({ jobId }: { jobId: number }) {
  const { data: logsData } = trpc.scraper.getLogs.useQuery({ jobId });

  return (
    <div className="border-t border-[#2A3142] bg-[#0B0E13] p-4 max-h-64 overflow-y-auto">
      {logsData?.logs.length === 0 ? (
        <p className="text-[12px] text-[#5A6478]">No logs yet</p>
      ) : (
        <div className="space-y-1.5">
          {logsData?.logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-[12px]">
              <span
                className={`w-16 flex-shrink-0 ${
                  log.level === "error"
                    ? "text-[#EF4444]"
                    : log.level === "warning"
                      ? "text-[#F59E0B]"
                      : "text-[#5A6478]"
                }`}
              >
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span
                className={
                  log.level === "error"
                    ? "text-[#EF4444]"
                    : log.level === "warning"
                      ? "text-[#F59E0B]"
                      : "text-[#8B95A8]"
                }
              >
                {log.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
