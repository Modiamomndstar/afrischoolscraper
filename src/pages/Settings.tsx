import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Download,
  Database,
  Globe,
  AlertTriangle,
} from "lucide-react";

export default function Settings() {
  const [exportFilename, setExportFilename] = useState("afrischools-export");
  const [csvDelimiter, setCsvDelimiter] = useState(",");
  const [defaultDelay, setDefaultDelay] = useState("1000");
  const [respectRobots, setRespectRobots] = useState(true);
  const [followPagination, setFollowPagination] = useState(true);

  return (
    <div className="max-w-[720px] mx-auto space-y-6">
      {/* Export Settings */}
      <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Download className="w-5 h-5 text-[#00C9A7]" />
          <h2 className="text-[16px] font-semibold text-[#E8ECF1]">
            Export Settings
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478] mb-2 block">
              Default Filename
            </label>
            <Input
              value={exportFilename}
              onChange={(e) => setExportFilename(e.target.value)}
              className="bg-[#0B0E13] border-[#3A4560] text-[#E8ECF1] h-10"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478] mb-2 block">
              CSV Delimiter
            </label>
            <div className="flex gap-3">
              {[
                { value: ",", label: "Comma (,)", default: true },
                { value: ";", label: "Semicolon (;)" },
                { value: "\t", label: "Tab" },
              ].map((delim) => (
                <button
                  key={delim.value}
                  onClick={() => setCsvDelimiter(delim.value)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-all ${
                    csvDelimiter === delim.value
                      ? "bg-[rgba(0,201,167,0.08)] text-[#00C9A7] border-[#00C9A7]/30"
                      : "bg-[#0B0E13] text-[#8B95A8] border-[#2A3142] hover:border-[#3A4560]"
                  }`}
                >
                  {delim.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scraper Settings */}
      <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-[#6366F1]" />
          <h2 className="text-[16px] font-semibold text-[#E8ECF1]">
            Scraper Defaults
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478] mb-2 block">
              Request Delay (ms)
            </label>
            <Input
              type="number"
              value={defaultDelay}
              onChange={(e) => setDefaultDelay(e.target.value)}
              min={100}
              max={10000}
              step={100}
              className="bg-[#0B0E13] border-[#3A4560] text-[#E8ECF1] h-10 w-40"
            />
            <p className="text-[12px] text-[#5A6478] mt-1">
              Delay between requests to avoid rate limiting. Default: 1000ms
            </p>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-[#2A3142]">
            <div>
              <div className="text-[14px] font-medium text-[#E8ECF1]">
                Respect robots.txt
              </div>
              <div className="text-[12px] text-[#5A6478]">
                Follow robots.txt directives on target websites
              </div>
            </div>
            <Switch
              checked={respectRobots}
              onCheckedChange={setRespectRobots}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-t border-[#2A3142]">
            <div>
              <div className="text-[14px] font-medium text-[#E8ECF1]">
                Follow Pagination
              </div>
              <div className="text-[12px] text-[#5A6478]">
                Automatically navigate through paginated results
              </div>
            </div>
            <Switch
              checked={followPagination}
              onCheckedChange={setFollowPagination}
            />
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="w-5 h-5 text-[#F59E0B]" />
          <h2 className="text-[16px] font-semibold text-[#E8ECF1]">
            Data Management
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-[#0B0E13] rounded-lg border border-[#2A3142]">
            <div>
              <div className="text-[14px] font-medium text-[#E8ECF1]">
                Backup Database
              </div>
              <div className="text-[12px] text-[#5A6478]">
                Export all data as a backup file
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[#3A4560] text-[#8B95A8] hover:text-[#E8ECF1] hover:border-[#E8ECF1]"
            >
              <Download className="w-4 h-4 mr-2" />
              Backup
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#0B0E13] rounded-lg border border-[#EF4444]/30">
            <div>
              <div className="text-[14px] font-medium text-[#EF4444]">
                Clear All Data
              </div>
              <div className="text-[12px] text-[#5A6478]">
                Permanently delete all school records
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-[#EF4444]/30 text-[#EF4444] hover:bg-[rgba(239,68,68,0.08)]"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Clear Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
