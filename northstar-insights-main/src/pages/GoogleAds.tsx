import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMetricFormat } from "@/hooks/useMetricFormat";
import { googleKPIs, googleDailyChart, searchTerms, deviceBreakdown, bidStrategies } from "@/data/googleAdsData";
import { campaigns, getCTR, getCPC, getConvRate, getROAS } from "@/data/mockData";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Monitor, Smartphone, Tablet } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Line, ComposedChart, Legend,
} from "recharts";

const GoogleAds = () => {
  const { formatCurrency, formatNumber, formatPercent, formatROAS } = useMetricFormat();

  const kpis = [
    { label: "Spend", displayValue: formatCurrency(googleKPIs.spend), change: 4.2, sparkline: googleDailyChart.slice(-7).map((d) => d.spend), color: "hsl(var(--google))" },
    { label: "Conversions", displayValue: formatNumber(googleKPIs.conversions), change: 8.1, sparkline: googleDailyChart.slice(-7).map((d) => d.conversions), color: "hsl(var(--google))" },
    { label: "ROAS", displayValue: formatROAS(googleKPIs.roas), change: 3.6, sparkline: googleDailyChart.slice(-7).map((d) => d.spend > 0 ? d.clicks / d.spend * 10 : 0), color: "hsl(var(--organic))" },
    { label: "Avg CPC", displayValue: formatCurrency(googleKPIs.avgCPC), change: -2.4, sparkline: googleDailyChart.slice(-7).map((d) => d.clicks > 0 ? d.spend / d.clicks : 0), color: "hsl(var(--accent))" },
  ];

  const googleCampaigns = useMemo(
    () => campaigns.filter((c) => c.platform === "google").map((c) => ({
      ...c, ctr: getCTR(c.clicks, c.impressions), cpc: getCPC(c.spend, c.clicks),
      convRate: getConvRate(c.conversions, c.clicks), roas: getROAS(c.revenue, c.spend),
    })),
    []
  );

  return (
    <DashboardLayout title="Google Ads">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.displayValue} change={kpi.change} sparkline={kpi.sparkline} color={kpi.color} delay={i * 80} />
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-4">
          <TabsList className="bg-[hsl(var(--surface-2))]">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="search">Search Terms</TabsTrigger>
            <TabsTrigger value="devices">Devices & Bids</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4">
            {/* Chart */}
            <div className="glass-card p-4">
              <h3 className="font-heading text-sm font-semibold text-foreground mb-4">Impressions & Conversions</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={googleDailyChart.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }} />
                    <Bar yAxisId="left" dataKey="impressions" fill="hsl(var(--google) / 0.3)" radius={[2, 2, 0, 0]} />
                    <Bar yAxisId="left" dataKey="conversions" fill="hsl(var(--google))" radius={[2, 2, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="ctr" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Campaign table */}
            <CampaignMiniTable campaigns={googleCampaigns} formatCurrency={formatCurrency} formatNumber={formatNumber} formatPercent={formatPercent} formatROAS={formatROAS} />
          </TabsContent>

          <TabsContent value="search">
            <SearchTermsTable />
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DeviceBreakdownCard />
              <BidStrategiesCard />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

// --- Mini campaign table ---
interface CampaignMiniTableProps {
  campaigns: any[];
  formatCurrency: (n: number) => string;
  formatNumber: (n: number) => string;
  formatPercent: (n: number) => string;
  formatROAS: (n: number) => string;
}

const CampaignMiniTable = ({ campaigns, formatCurrency, formatNumber, formatPercent, formatROAS }: CampaignMiniTableProps) => {
  const roasColor = (r: number) => (r > 4 ? "text-emerald-400" : r > 2 ? "text-amber-400" : "text-red-400");

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="font-heading text-sm font-semibold text-foreground">Google Campaigns</h3>
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

// --- Search Terms Table ---
const SearchTermsTable = () => {
  const { formatNumber, formatCurrency, formatPercent } = useMetricFormat();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 10;

  const filtered = useMemo(() => searchTerms.filter((t) => t.query.toLowerCase().includes(search.toLowerCase())), [search]);
  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const qsColor = (qs: number) => qs >= 8 ? "bg-emerald-400/20 text-emerald-400" : qs >= 5 ? "bg-amber-400/20 text-amber-400" : "bg-red-400/20 text-red-400";

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold text-foreground">Search Terms</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input type="text" placeholder="Search queries..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-8 pr-3 py-1.5 rounded-md bg-[hsl(var(--surface-1))] border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-52" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {["Query", "Match", "Impr.", "Clicks", "CTR", "CPC", "Conv.", "QS"].map((h) => (
                <th key={h} className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((t, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-[hsl(var(--surface-hover))] transition-colors">
                <td className="px-3 py-2.5 text-foreground font-medium">{t.query}</td>
                <td className="px-3 py-2.5"><span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[hsl(var(--surface-2))] text-muted-foreground">{t.matchType}</span></td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatNumber(t.impressions)}</td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatNumber(t.clicks)}</td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatPercent(t.ctr)}</td>
                <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatCurrency(t.cpc)}</td>
                <td className="px-3 py-2.5 font-mono text-foreground">{formatNumber(t.conversions)}</td>
                <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${qsColor(t.qualityScore)}`}>{t.qualityScore}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 flex items-center justify-between border-t border-border">
        <p className="text-xs text-muted-foreground">{filtered.length} terms</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-1 rounded hover:bg-[hsl(var(--surface-hover))] disabled:opacity-30 text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-1 rounded hover:bg-[hsl(var(--surface-hover))] disabled:opacity-30 text-muted-foreground"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

// --- Device Breakdown ---
const DeviceBreakdownCard = () => {
  const { formatNumber } = useMetricFormat();
  const icons = { Desktop: Monitor, Mobile: Smartphone, Tablet: Tablet };
  const maxClicks = Math.max(...deviceBreakdown.map((d) => d.clicks));

  return (
    <div className="glass-card p-4 space-y-4">
      <h3 className="font-heading text-sm font-semibold text-foreground">Device Breakdown</h3>
      <div className="space-y-4">
        {deviceBreakdown.map((d) => {
          const Icon = icons[d.device as keyof typeof icons];
          return (
            <div key={d.device} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-foreground">{d.device}</span>
                </div>
                <span className="text-xs text-muted-foreground">{d.share}%</span>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-[hsl(var(--surface-2))] overflow-hidden">
                    <div className="h-full rounded-full bg-[hsl(var(--google))]" style={{ width: `${(d.clicks / maxClicks) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatNumber(d.clicks)} clicks</p>
                </div>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-[hsl(var(--surface-2))] overflow-hidden">
                    <div className="h-full rounded-full bg-[hsl(var(--organic))]" style={{ width: `${(d.conversions / deviceBreakdown[0].conversions) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatNumber(d.conversions)} conv.</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Bid Strategies ---
const BidStrategiesCard = () => {
  const statusColor = (s: string) => s === "Above Target" ? "text-emerald-400 bg-emerald-400/10" : s === "On Track" ? "text-amber-400 bg-amber-400/10" : "text-red-400 bg-red-400/10";

  return (
    <div className="glass-card p-4 space-y-3">
      <h3 className="font-heading text-sm font-semibold text-foreground">Bid Strategies</h3>
      <div className="space-y-3">
        {bidStrategies.map((b) => (
          <div key={b.name} className="p-3 rounded-lg bg-[hsl(var(--surface-2))] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">{b.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColor(b.status)}`}>{b.status}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">{b.type} · {b.campaigns} campaigns</p>
            {b.target > 0 && (
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-muted-foreground">Target: <span className="font-mono text-foreground">{b.type === "Target ROAS" ? `${b.target}x` : `$${b.target}`}</span></span>
                <span className="text-muted-foreground">Actual: <span className="font-mono text-foreground">{b.type === "Target ROAS" ? `${b.actual}x` : `$${b.actual}`}</span></span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoogleAds;
