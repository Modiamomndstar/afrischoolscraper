import { trpc } from "@/providers/trpc";
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
  LineChart,
  Line,
} from "recharts";
import { Building2, Globe, Database, TrendingUp } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  primary: "#00C9A7",
  secondary: "#6366F1",
  tertiary: "#F59E0B",
  vocational: "#3B82F6",
  special_needs: "#EF4444",
};

export default function Analytics() {
  const { data: stats, isLoading } = trpc.school.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#5A6478]">Loading analytics...</div>
      </div>
    );
  }

  const categoryData =
    stats?.schoolsByCategory.map((item) => ({
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      value: item.count,
      color: CATEGORY_COLORS[item.category] ?? "#8B95A8",
    })) ?? [];

  const countryData =
    stats?.schoolsByCountry.map((item) => ({
      name: item.country,
      count: item.count,
    })) ?? [];

  const timelineData =
    stats?.recentAdditions.map((item) => ({
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: item.count,
    })) ?? [];

  const typeData =
    stats?.schoolsByType.map((item) => ({
      name: item.type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      count: item.count,
    })) ?? [];

  // Data quality metric placeholder
  // const totalContactInfo = ...

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Schools",
            value: stats?.totalSchools ?? 0,
            icon: Building2,
            color: "#00C9A7",
          },
          {
            label: "Countries",
            value: stats?.totalCountries ?? 0,
            icon: Globe,
            color: "#6366F1",
          },
          {
            label: "States Mapped",
            value: stats?.totalStates ?? 0,
            icon: Database,
            color: "#F59E0B",
          },
          {
            label: "Sessions Today",
            value: stats?.scraperJobsToday ?? 0,
            icon: TrendingUp,
            color: "#3B82F6",
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="bg-[#11151F] border border-[#2A3142] rounded-[10px] p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${metric.color}15` }}
              >
                <metric.icon
                  className="w-5 h-5"
                  style={{ color: metric.color }}
                />
              </div>
              <span className="text-[11px] font-medium uppercase tracking-widest text-[#5A6478]">
                {metric.label}
              </span>
            </div>
            <span className="text-[32px] font-bold text-[#E8ECF1] tabular-nums">
              {metric.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-12 gap-4">
        {/* Country Distribution */}
        <div className="col-span-7 bg-[#11151F] border border-[#2A3142] rounded-[10px] p-5">
          <h3 className="text-[16px] font-semibold text-[#E8ECF1] mb-4">
            Schools by Country
          </h3>
          <div className="h-[300px]">
            {countryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(42,49,66,0.3)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "#5A6478", fontSize: 12 }}
                    axisLine={{ stroke: "#2A3142" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "#8B95A8", fontSize: 12 }}
                    axisLine={{ stroke: "#2A3142" }}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1A1F2E",
                      border: "1px solid #2A3142",
                      borderRadius: 8,
                      color: "#E8ECF1",
                    }}
                  />
                  <Bar dataKey="count" fill="#00C9A7" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#5A6478]">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Category Pie */}
        <div className="col-span-5 bg-[#11151F] border border-[#2A3142] rounded-[10px] p-5">
          <h3 className="text-[16px] font-semibold text-[#E8ECF1] mb-4">
            Category Breakdown
          </h3>
          <div className="h-[250px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
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
          <div className="flex flex-wrap gap-2 justify-center">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: item.color }}
                />
                <span className="text-[11px] text-[#8B95A8]">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-12 gap-4">
        {/* Collection Trend */}
        <div className="col-span-8 bg-[#11151F] border border-[#2A3142] rounded-[10px] p-5">
          <h3 className="text-[16px] font-semibold text-[#E8ECF1] mb-4">
            Collection Trend
          </h3>
          <div className="h-[250px]">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(42,49,66,0.3)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
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
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#00C9A7"
                    strokeWidth={2}
                    dot={{ fill: "#00C9A7", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-[#5A6478]">
                No collection data yet
              </div>
            )}
          </div>
        </div>

        {/* Type Distribution */}
        <div className="col-span-4 bg-[#11151F] border border-[#2A3142] rounded-[10px] p-5">
          <h3 className="text-[16px] font-semibold text-[#E8ECF1] mb-4">
            School Types
          </h3>
          <div className="space-y-3">
            {typeData.length > 0 ? (
              typeData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="text-[13px] text-[#8B95A8]">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-[#1A1F2E] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00C9A7] rounded-full"
                        style={{
                          width: `${Math.min(100, (item.count / (typeData[0]?.count ?? 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[13px] text-[#E8ECF1] tabular-nums w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[13px] text-[#5A6478]">No data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
