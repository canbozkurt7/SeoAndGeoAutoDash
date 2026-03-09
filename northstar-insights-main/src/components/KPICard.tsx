import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface KPICardProps {
  label: string;
  value: string;
  change: number;
  sparkline: number[];
  color: string;
  delay: number;
}

export const KPICard = ({ label, value, change, sparkline, color, delay }: KPICardProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const chartData = sparkline.map((v, i) => ({ v, i }));
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div
      className={`glass-card p-4 transition-all duration-400 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-2xl font-medium tracking-tight text-foreground">{value}</p>
          <div className="flex items-center gap-1 mt-1">
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                isPositive ? "change-positive" : isNegative ? "change-negative" : "change-neutral"
              }`}
            >
              {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {Math.abs(change)}%
            </span>
          </div>
        </div>
        <div className="w-20 h-10 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                fill={`url(#spark-${label})`}
                strokeWidth={1.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
