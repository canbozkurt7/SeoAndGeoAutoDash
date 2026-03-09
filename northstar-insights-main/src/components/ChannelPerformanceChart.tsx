import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { dailyData } from "@/data/mockData";

export const ChannelPerformanceChart = () => {
  const data = dailyData.slice(-30).map((d) => ({
    date: d.date.slice(5),
    googleSpend: d.google.spend,
    googleRev: d.google.revenue,
    metaSpend: d.meta.spend,
    metaRev: d.meta.revenue,
    yandexSpend: d.yandex.spend,
    yandexRev: d.yandex.revenue,
  }));

  return (
    <div className="glass-card p-5">
      <h3 className="font-heading text-sm font-semibold text-foreground mb-4">
        Channel Performance — Last 30 Days
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4285F4" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#4285F4" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0081FB" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#0081FB" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="yFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FC3F1D" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#FC3F1D" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              contentStyle={{
                background: "#111318",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#E5E7EB",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", color: "#9CA3AF" }}
            />
            <Area type="monotone" dataKey="googleRev" name="Google Revenue" stroke="#4285F4" fill="url(#gFill)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="metaRev" name="Meta Revenue" stroke="#0081FB" fill="url(#mFill)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="yandexRev" name="Yandex Revenue" stroke="#FC3F1D" fill="url(#yFill)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
