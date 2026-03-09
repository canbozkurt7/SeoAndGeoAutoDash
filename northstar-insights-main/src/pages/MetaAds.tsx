import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMetricFormat } from "@/hooks/useMetricFormat";
import { metaKPIs, funnelData, placements, creatives, frequencyWarnings, metaDailyChart } from "@/data/metaAdsData";
import { campaigns, getCTR, getCPC, getConvRate, getROAS } from "@/data/mockData";
import { Search, ChevronLeft, ChevronRight, AlertTriangle, Image as ImageIcon, Film, Layers } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const MetaAds = () => {
  const { formatCurrency, formatNumber, formatPercent, formatROAS } = useMetricFormat();

  const kpis = [
    { label: "Spend", displayValue: formatCurrency(metaKPIs.spend), change: 6.8, sparkline: metaDailyChart.slice(-7).map((d) => d.spend), color: "hsl(var(--meta))" },
    { label: "Reach", displayValue: formatNumber(metaKPIs.reach), change: 12.4, sparkline: metaDailyChart.slice(-7).map((d) => Math.round(d.impressions * 0.62)), color: "hsl(var(--meta))" },
    { label: "CPM", displayValue: `$${metaKPIs.cpm.toFixed(2)}`, change: -3.2, sparkline: metaDailyChart.slice(-7).map((d) => d.impressions > 0 ? (d.spend / d.impressions) * 1000 : 0), color: "hsl(var(--accent))" },
    { label: "ROAS", displayValue: formatROAS(metaKPIs.roas), change: 5.1, sparkline: metaDailyChart.slice(-7).map((d) => d.spend > 0 ? d.revenue / d.spend : 0), color: "hsl(var(--organic))" },
  ];

  const metaCampaigns = useMemo(
    () => campaigns.filter((c) => c.platform === "meta").map((c) => ({
      ...c, ctr: getCTR(c.clicks, c.impressions), cpc: getCPC(c.spend, c.clicks),
      convRate: getConvRate(c.conversions, c.clicks), roas: getROAS(c.revenue, c.spend),
    })),
    []
  );

  return (
    <DashboardLayout title="Meta Ads">
      <div className="space-y-6">
        {/* Frequency warnings */}
        {frequencyWarnings.length > 0 && (
          <div className="space-y-2">
            {frequencyWarnings.map((w) => (
              <div key={w.campaign} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-300">
                  High frequency detected in <span className="font-medium text-amber-200">{w.campaign}</span> (freq: {w.frequency.toFixed(1)}) — consider refreshing creatives
                </p>
              </div>
            ))}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.displayValue} change={kpi.change} sparkline={kpi.sparkline} color={kpi.color} delay={i * 80} />
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-[hsl(var(--surface-2))]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="creatives">Creatives</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Funnel */}
            <div className="glass-card p-4">
              <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Conversion Funnel</h3>
              <div className="flex items-stretch gap-1">
                {funnelData.map((stage, i) => {
                  const widthPct = (stage.value / funnelData[0].value) * 100;
                  return (
                    <div key={stage.stage} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full relative" style={{ height: 120 }}>
                        <div
                          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-md"
                          style={{
                            width: `${Math.max(widthPct, 20)}%`,
                            height: `${Math.max(widthPct, 15)}%`,
                            background: `hsl(var(--meta) / ${1 - i * 0.15})`,
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="font-mono text-sm font-medium text-foreground">{formatNumber(stage.value)}</p>
                        <p className="text-[10px] text-muted-foreground">{stage.stage}</p>
                        {stage.dropOff > 0 && (
                          <p className="text-[10px] text-red-400 mt-0.5">-{stage.dropOff}%</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Placements */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {placements.map((p) => (
                <div key={p.placement} className="glass-card p-4 space-y-2">
                  <h4 className="text-xs font-medium text-foreground">{p.placement}</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">Spend Share</span>
                      <span className="font-mono text-foreground">{p.spendShare}%</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">CTR</span>
                      <span className="font-mono text-foreground">{p.ctr}%</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">ROAS</span>
                      <span className={`font-mono font-medium ${p.roas > 4 ? "text-emerald-400" : p.roas > 2 ? "text-amber-400" : "text-red-400"}`}>{p.roas}x</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-[hsl(var(--surface-2))] overflow-hidden">
                    <div className="h-full rounded-full bg-[hsl(var(--meta))]" style={{ width: `${p.spendShare}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Spend chart */}
            <div className="glass-card p-4">
              <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Spend & Revenue Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metaDailyChart.slice(-30)}>
                    <defs>
                      <linearGradient id="metaSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--meta))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--meta))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }} />
                    <Area type="monotone" dataKey="spend" stroke="hsl(var(--meta))" fill="url(#metaSpend)" strokeWidth={2} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--organic))" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="creatives">
            <CreativeTable />
          </TabsContent>

          <TabsContent value="campaigns">
            <MetaCampaignTable campaigns={metaCampaigns} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// --- Creative Table ---
const CreativeTable = () => {
  const { formatCurrency, formatNumber, formatPercent, formatROAS } = useMetricFormat();
  const formatBadge: Record<string, { icon: typeof Film; class: string }> = {
    Video: { icon: Film, class: "bg-purple-400/20 text-purple-400" },
    Image: { icon: ImageIcon, class: "bg-blue-400/20 text-blue-400" },
    Carousel: { icon: Layers, class: "bg-amber-400/20 text-amber-400" },
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-heading text-sm font-semibold text-foreground">Creative Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {["", "Ad Name", "Format", "Spend", "Impr.", "CTR", "Hook Rate", "ROAS"].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {creatives.map((c) => {
              const badge = formatBadge[c.format];
              const Icon = badge.icon;
              return (
                <tr key={c.id} className="border-b border-border/50 hover:bg-[hsl(var(--surface-hover))] transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="w-10 h-10 rounded bg-[hsl(var(--surface-2))] flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-foreground font-medium max-w-[200px] truncate">{c.name}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.class}`}>
                      <Icon className="w-3 h-3" />{c.format}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-foreground">{formatCurrency(c.spend)}</td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatNumber(c.impressions)}</td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatPercent(c.ctr)}</td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">{c.hookRate > 0 ? `${c.hookRate}%` : "—"}</td>
                  <td className={`px-3 py-2.5 font-mono font-medium ${c.roas > 4 ? "text-emerald-400" : c.roas > 2 ? "text-amber-400" : "text-red-400"}`}>{formatROAS(c.roas)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Meta Campaign Table ---
const MetaCampaignTable = ({ campaigns }: { campaigns: any[] }) => {
  const { formatCurrency, formatNumber, formatPercent, formatROAS } = useMetricFormat();
  const roasColor = (r: number) => (r > 4 ? "text-emerald-400" : r > 2 ? "text-amber-400" : "text-red-400");

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-heading text-sm font-semibold text-foreground">Meta Campaigns</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {["Campaign", "Status", "Spend", "Clicks", "CTR", "CPC", "Conv.", "ROAS"].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-[hsl(var(--surface-hover))] transition-colors">
                <td className="px-3 py-2.5 text-foreground font-medium max-w-[200px] truncate">{c.name}</td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${c.status === "Active" ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                    <span className="text-muted-foreground">{c.status}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-foreground">{formatCurrency(c.spend)}</td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatNumber(c.clicks)}</td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatPercent(c.ctr)}</td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatCurrency(c.cpc)}</td>
                <td className="px-3 py-2.5 font-mono text-foreground">{formatNumber(c.conversions)}</td>
                <td className={`px-3 py-2.5 font-mono font-medium ${roasColor(c.roas)}`}>{formatROAS(c.roas)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MetaAds;
