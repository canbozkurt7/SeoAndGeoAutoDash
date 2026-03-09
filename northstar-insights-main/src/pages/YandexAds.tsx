import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { useMetricFormat } from "@/hooks/useMetricFormat";
import { yandexKPIs, currencyRates, regionPerformance, clickHeatmap, heatmapDays, yandexDailyChart } from "@/data/yandexAdsData";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { MapPin } from "lucide-react";

const YandexAds = () => {
  const { formatNumber, formatPercent } = useMetricFormat();
  const [currency, setCurrency] = useState<"RUB" | "USD" | "EUR">("RUB");
  const rate = currencyRates[currency];
  const sym = currency === "RUB" ? "₽" : currency === "USD" ? "$" : "€";

  const fmtCur = (n: number) => {
    const v = n * rate;
    if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(1)}K`;
    return `${sym}${Math.round(v).toLocaleString()}`;
  };

  const kpis = [
    { label: "Spend", displayValue: fmtCur(yandexKPIs.spendRub), change: 3.8, sparkline: yandexDailyChart.slice(-7).map((d) => d.spend * rate), color: "hsl(var(--yandex))" },
    { label: "Clicks", displayValue: formatNumber(yandexKPIs.clicks), change: 5.2, sparkline: yandexDailyChart.slice(-7).map((d) => d.clicks), color: "hsl(var(--yandex))" },
    { label: "CPC", displayValue: fmtCur(yandexKPIs.cpcRub), change: -1.8, sparkline: yandexDailyChart.slice(-7).map((d) => d.cpc * rate), color: "hsl(var(--accent))" },
    { label: "Conversions", displayValue: formatNumber(yandexKPIs.conversions), change: 7.4, sparkline: yandexDailyChart.slice(-7).map((d) => d.conversions), color: "hsl(var(--organic))" },
  ];

  const maxHeat = Math.max(...clickHeatmap.flat());

  return (
    <DashboardLayout title="Yandex Ads">
      <div className="space-y-6">
        {/* Currency toggle */}
        <div className="flex justify-end">
          <div className="inline-flex rounded-lg bg-[hsl(var(--surface-2))] p-0.5">
            {(["RUB", "USD", "EUR"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  currency === c ? "bg-[hsl(var(--yandex))] text-white" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.displayValue} change={kpi.change} sparkline={kpi.sparkline} color={kpi.color} delay={i * 80} />
          ))}
        </div>

        {/* Chart */}
        <div className="glass-card p-4">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Clicks & CPC Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yandexDailyChart.slice(-30).map((d) => ({ ...d, cpc: d.cpc * rate, spend: d.spend * rate }))}>
                <defs>
                  <linearGradient id="yandexArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--yandex))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--yandex))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }} />
                <Area yAxisId="left" type="monotone" dataKey="clicks" stroke="hsl(var(--yandex))" fill="url(#yandexArea)" strokeWidth={2} />
                <Area yAxisId="right" type="monotone" dataKey="cpc" stroke="hsl(var(--accent))" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Region Table */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-heading text-sm font-semibold text-foreground">Region Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["Region", "Impr.", "Clicks", "CTR", "CPC", "Conv."].map((h) => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {regionPerformance.map((r) => (
                    <tr key={r.region} className="border-b border-border/50 hover:bg-[hsl(var(--surface-hover))] transition-colors">
                      <td className="px-3 py-2.5 text-foreground font-medium">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[hsl(var(--yandex))]" />
                          {r.region}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatNumber(r.impressions)}</td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatNumber(r.clicks)}</td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatPercent(r.ctr)}</td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">{fmtCur(r.cpc)}</td>
                      <td className="px-3 py-2.5 font-mono text-foreground">{formatNumber(r.conversions)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Heatmap */}
          <div className="glass-card p-4">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-1">Click Heatmap — Best Performing Hours</h3>
            <p className="text-[10px] text-muted-foreground mb-4">Days × Hours · Color intensity = click volume</p>
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                {/* Hour labels */}
                <div className="flex ml-10">
                  {Array.from({ length: 24 }, (_, h) => (
                    <div key={h} className="flex-1 text-center text-[8px] text-muted-foreground">{h}</div>
                  ))}
                </div>
                {/* Grid */}
                {clickHeatmap.map((row, dayIdx) => (
                  <div key={dayIdx} className="flex items-center">
                    <span className="w-10 text-[10px] text-muted-foreground shrink-0">{heatmapDays[dayIdx]}</span>
                    <div className="flex flex-1 gap-px">
                      {row.map((val, hIdx) => {
                        const intensity = val / maxHeat;
                        return (
                          <div
                            key={hIdx}
                            className="flex-1 aspect-square rounded-sm"
                            style={{ background: `hsl(var(--yandex) / ${0.1 + intensity * 0.9})` }}
                            title={`${heatmapDays[dayIdx]} ${hIdx}:00 — ${val} clicks`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
                {/* Legend */}
                <div className="flex items-center justify-end gap-2 mt-3">
                  <span className="text-[9px] text-muted-foreground">Low</span>
                  <div className="flex gap-px">
                    {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => (
                      <div key={o} className="w-4 h-3 rounded-sm" style={{ background: `hsl(var(--yandex) / ${o})` }} />
                    ))}
                  </div>
                  <span className="text-[9px] text-muted-foreground">High</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default YandexAds;
