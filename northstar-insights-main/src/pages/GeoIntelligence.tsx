import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { countryPerformance, geoAnomalies, regionTrends } from "@/data/geoData";
import { useMetricFormat } from "@/hooks/useMetricFormat";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { AlertTriangle, TrendingUp, TrendingDown, Lightbulb, ArrowUpDown, Globe2 } from "lucide-react";

type SortKey = "country" | "spend" | "revenue" | "roas" | "cpa" | "conversions";
type SortDir = "asc" | "desc";

const GeoIntelligence = () => {
  const { formatCurrency, formatNumber } = useMetricFormat();
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const sorted = [...countryPerformance].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    return (a[sortKey] > b[sortKey] ? 1 : -1) * mul;
  });

  const totalSpend = countryPerformance.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = countryPerformance.reduce((s, c) => s + c.revenue, 0);
  const totalConversions = countryPerformance.reduce((s, c) => s + c.conversions, 0);
  const blendedROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  const anomalyIcon = (type: string) => {
    if (type === "spike") return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (type === "drop") return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Lightbulb className="w-4 h-4 text-accent" />;
  };

  const SortHeader = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="text-right px-4 py-3 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
      onClick={() => handleSort(k)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === k && <ArrowUpDown className="w-3 h-3" />}
      </span>
    </th>
  );

  // Channel mix bar data
  const channelMixData = countryPerformance.slice(0, 8).map(c => ({
    country: c.code,
    Google: c.channels.google,
    Meta: c.channels.meta,
    Yandex: c.channels.yandex,
  }));

  return (
    <DashboardLayout title="Geo Intelligence">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-surface-1 border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="countries">Country Table</TabsTrigger>
          <TabsTrigger value="trends">Regional Trends</TabsTrigger>
          <TabsTrigger value="alerts">Anomaly Alerts</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Global Spend", value: formatCurrency(totalSpend) },
              { label: "Global Revenue", value: formatCurrency(totalRevenue) },
              { label: "Blended ROAS", value: `${blendedROAS.toFixed(2)}x` },
              { label: "Total Conversions", value: formatNumber(totalConversions) },
            ].map(kpi => (
              <Card key={kpi.label} className="bg-surface-1 border-border">
                <CardContent className="pt-5 pb-4 px-5">
                  <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                  <p className="font-mono text-2xl font-medium text-foreground">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Channel mix by country */}
          <Card className="bg-surface-1 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Channel Mix by Country</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={channelMixData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis dataKey="country" type="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={40} />
                  <Tooltip contentStyle={{ background: "hsl(var(--surface-1))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Google" stackId="a" fill="hsl(var(--google))" />
                  <Bar dataKey="Meta" stackId="a" fill="hsl(var(--meta))" />
                  <Bar dataKey="Yandex" stackId="a" fill="hsl(var(--yandex))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top 5 anomalies */}
          <Card className="bg-surface-1 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" /> Performance Anomalies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {geoAnomalies.slice(0, 3).map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface-2/50">
                  {anomalyIcon(a.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{a.country} — {a.metric}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.message}</p>
                  </div>
                  <span className={`text-xs font-mono px-2 py-1 rounded ${a.change > 0 ? "change-positive" : "change-negative"}`}>
                    {a.change > 0 ? "+" : ""}{a.change}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* COUNTRY TABLE */}
        <TabsContent value="countries">
          <Card className="bg-surface-1 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <Globe2 className="w-4 h-4" /> Country Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground cursor-pointer" onClick={() => handleSort("country")}>Country</th>
                    <SortHeader label="Spend" k="spend" />
                    <SortHeader label="Revenue" k="revenue" />
                    <SortHeader label="ROAS" k="roas" />
                    <SortHeader label="CPA" k="cpa" />
                    <SortHeader label="Conversions" k="conversions" />
                    <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Channel Split</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(c => (
                    <tr key={c.code} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{c.country}</td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">{formatCurrency(c.spend)}</td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">{formatCurrency(c.revenue)}</td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">{c.roas.toFixed(2)}x</td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">{formatCurrency(c.cpa)}</td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">{formatNumber(c.conversions)}</td>
                      <td className="px-4 py-3">
                        <div className="flex h-2 rounded-full overflow-hidden w-24 ml-auto">
                          {c.channels.google > 0 && <div style={{ width: `${c.channels.google}%` }} className="bg-google" />}
                          {c.channels.meta > 0 && <div style={{ width: `${c.channels.meta}%` }} className="bg-meta" />}
                          {c.channels.yandex > 0 && <div style={{ width: `${c.channels.yandex}%` }} className="bg-yandex" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REGIONAL TRENDS */}
        <TabsContent value="trends">
          <Card className="bg-surface-1 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Revenue by Region (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={regionTrends.days}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--surface-1))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="North America" stackId="1" stroke="hsl(var(--google))" fill="hsl(var(--google))" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="Europe" stackId="1" stroke="hsl(var(--meta))" fill="hsl(var(--meta))" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="CIS" stackId="1" stroke="hsl(var(--yandex))" fill="hsl(var(--yandex))" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="APAC" stackId="1" stroke="hsl(var(--organic))" fill="hsl(var(--organic))" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="LATAM" stackId="1" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANOMALY ALERTS */}
        <TabsContent value="alerts">
          <Card className="bg-surface-1 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" /> All Anomalies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {geoAnomalies.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-4 rounded-lg bg-surface-2/50 border border-border/50">
                  {anomalyIcon(a.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">{a.country}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider">{a.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.message}</p>
                  </div>
                  <span className={`text-xs font-mono px-2 py-1 rounded ${a.change > 0 ? "change-positive" : "change-negative"}`}>
                    {a.change > 0 ? "+" : ""}{a.change}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default GeoIntelligence;
