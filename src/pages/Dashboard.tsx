import { trpc } from "@/providers/trpc";
import {
  Building2,
  Globe,
  Bot,
  Database,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CATEGORY_COLORS: Record<string, string> = {
  primary: "#00C9A7",
  secondary: "#6366F1",
  tertiary: "#F59E0B",
  vocational: "#3B82F6",
  special_needs: "#EF4444",
};

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.school.getStats.useQuery();

  const metricCards = [
    {
      label: "Total Schools",
      value: stats?.totalSchools ?? 0,
      icon: Building2,
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Countries Covered",
      value: stats?.totalCountries ?? 0,
      icon: Globe,
      subtitle: "active",
    },
    {
      label: "States/Regions",
      value: stats?.totalStates ?? 0,
      icon: Database,
      subtitle: "mapped",
    },
    {
      label: "Scraper Sessions",
      value: stats?.scraperJobsToday ?? 0,
      icon: Bot,
      subtitle: "today",
    },
  ];

  const categoryData =
    stats?.schoolsByCategory.map((item) => ({
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      value: item.count,
      color: CATEGORY_COLORS[item.category] ?? "#8B95A8",
    })) ?? [];

  const timelineData =
    stats?.recentAdditions.map((item) => ({
      day: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
      count: item.count,
    })) ?? [];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <div
            key={card.label}
            className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478]">
                {card.label}
              </span>
              <card.icon className="w-5 h-5 text-[#5A6478]" />
            </div>
            <div className="flex items-end justify-between">
              <span className="text-[32px] font-bold text-[#E8ECF1] tabular-nums leading-none">
                {isLoading ? "—" : card.value.toLocaleString()}
              </span>
              {card.trend && (
                <span
                  className={`flex items-center text-[13px] font-medium ${
                    card.trendUp ? "text-[#22C55E]" : "text-[#EF4444]"
                  }`}
                >
                  {card.trendUp ? (
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 mr-1" />
                  )}
                  {card.trend}
                </span>
              )}
              {card.subtitle && (
                <span className="text-[13px] text-[#5A6478]">
                  {card.value} {card.subtitle}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-12 gap-4">
        {/* Collection Timeline */}
        <div className="col-span-8 bg-[#11151F] border border-[#2A3142] rounded-[10px] p-5">
          <h3 className="text-[16px] font-semibold text-[#E8ECF1] mb-4">
            Collection Timeline
          </h3>
          <div className="h-[280px]">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(42,49,66,0.3)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#5A6478", fontSize: 12 }}
                    axisLine={{ stroke: "#2A3142" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#5A6478", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1A1F2E",
                      border: "1px solid #2A3142",
                      borderRadius: 8,
                      color: "#E8ECF1",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#00C9A7"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#5A6478]">
                No collection data yet. Start a scraper job to see data.
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="col-span-4 bg-[#11151F] border border-[#2A3142] rounded-[10px] p-5">
          <h3 className="text-[16px] font-semibold text-[#E8ECF1] mb-4">
            Category Distribution
          </h3>
          <div className="h-[280px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1A1F2E",
                      border: "1px solid #2A3142",
                      borderRadius: 8,
                      color: "#E8ECF1",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#5A6478]">
                No data
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: item.color }}
                />
                <span className="text-[11px] text-[#8B95A8]">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-3 gap-4">
        {/* Top Countries */}
        <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-5">
          <h3 className="text-[16px] font-semibold text-[#E8ECF1] mb-4">
            Top Countries
          </h3>
          <div className="space-y-3">
            {stats?.schoolsByCountry.slice(0, 5).map((item) => (
              <div key={item.country} className="flex items-center justify-between">
                <span className="text-[13px] text-[#8B95A8]">{item.country}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-[#1A1F2E] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00C9A7] rounded-full"
                      style={{
                        width: `${Math.min(100, (item.count / (stats?.schoolsByCountry[0]?.count ?? 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-[13px] text-[#E8ECF1] tabular-nums w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            )) ?? (
              <div className="text-[13px] text-[#5A6478]">No data available</div>
            )}
          </div>
        </div>

        {/* School Types */}
        <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-5">
          <h3 className="text-[16px] font-semibold text-[#E8ECF1] mb-4">
            School Types
          </h3>
          <div className="space-y-3">
            {stats?.schoolsByType.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <span className="text-[13px] text-[#8B95A8] capitalize">
                  {item.type.replace(/_/g, " ")}
                </span>
                <span className="text-[13px] text-[#E8ECF1] tabular-nums">
                  {item.count}
                </span>
              </div>
            )) ?? (
              <div className="text-[13px] text-[#5A6478]">No data available</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-5">
          <h3 className="text-[16px] font-semibold text-[#E8ECF1] mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <a
              href="/scraper"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1F2E] hover:bg-[rgba(0,201,167,0.08)] border border-[#2A3142] hover:border-[#00C9A7] transition-all group"
            >
              <Bot className="w-5 h-5 text-[#00C9A7]" />
              <div>
                <div className="text-[13px] font-medium text-[#E8ECF1] group-hover:text-[#00C9A7]">
                  Start New Scrape
                </div>
                <div className="text-[11px] text-[#5A6478]">
                  Collect data from web sources
                </div>
              </div>
            </a>
            <a
              href="/schools"
              className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1F2E] hover:bg-[rgba(0,201,167,0.08)] border border-[#2A3142] hover:border-[#00C9A7] transition-all group"
            >
              <Building2 className="w-5 h-5 text-[#6366F1]" />
              <div>
                <div className="text-[13px] font-medium text-[#E8ECF1] group-hover:text-[#00C9A7]">
                  Browse Schools
                </div>
                <div className="text-[11px] text-[#5A6478]">
                  View and filter collected data
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
