import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { channelMix } from "@/data/mockData";
import { useMetricFormat } from "@/hooks/useMetricFormat";

const COLORS = ["#4285F4", "#0081FB", "#FC3F1D"];
const data = [
  { name: "Google", value: channelMix.google },
  { name: "Meta", value: channelMix.meta },
  { name: "Yandex", value: channelMix.yandex },
];
const total = data.reduce((a, b) => a + b.value, 0);

export const ChannelMixDonut = () => {
  const { formatCurrency } = useMetricFormat();

  return (
    <div className="glass-card p-5 flex flex-col items-center">
      <h3 className="font-heading text-sm font-semibold text-foreground mb-4 self-start">
        Spend Distribution
      </h3>
      <div className="relative w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#111318",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#E5E7EB",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xs text-muted-foreground">Total Spend</p>
          <p className="font-mono text-lg font-medium text-foreground">{formatCurrency(total)}</p>
        </div>
      </div>
      {/* Legend */}
      <div className="flex gap-4 mt-2">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
            <span className="text-xs text-muted-foreground">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
