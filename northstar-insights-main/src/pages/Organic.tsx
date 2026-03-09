import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import {
  organicOverviewKPIs, organicTrend, topPages, topKeywords,
  coreWebVitals, cwvHistory,
  type PageRow, type KeywordRow,
} from "@/data/organicData";
import { useMetricFormat } from "@/hooks/useMetricFormat";
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown, Globe } from "lucide-react";
import { useState } from "react";

/* ───── helpers ───── */
const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
  if (trend === "up") return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === "down") return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
};

const ratingColor = (r: string) => {
  if (r === "good") return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  if (r === "needs-improvement") return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-red-400 bg-red-400/10 border-red-400/20";
};

type SortKey<T> = keyof T;
function useSortable<T>(data: T[], defaultKey: SortKey<T>) {
  const [sortKey, setSortKey] = useState<SortKey<T>>(defaultKey);
  const [asc, setAsc] = useState(false);
  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey] as number;
    const bv = b[sortKey] as number;
    return asc ? av - bv : bv - av;
  });
  const toggle = (key: SortKey<T>) => {
    if (key === sortKey) setAsc(!asc);
    else { setSortKey(key); setAsc(false); }
  };
  return { sorted, sortKey, asc, toggle };
}

/* ───── Overview Tab ───── */
const OverviewTab = () => {
  const { formatNumber, formatPercent } = useMetricFormat();
  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {organicOverviewKPIs.map((kpi) => (
          <Card key={kpi.label} className="glass-card">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="font-mono text-2xl font-semibold text-foreground">
                {kpi.format === "percent" ? formatPercent(kpi.value) : formatNumber(kpi.value)}
              </p>
              <span className={`inline-flex items-center gap-1 text-xs mt-1 ${kpi.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {kpi.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(kpi.change)}%
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trend chart */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Clicks & Impressions — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={organicTrend}>
                <defs>
                  <linearGradient id="ogClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142,53%,43%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(142,53%,43%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(230,12%,14%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(220,10%,50%)" }} tickFormatter={(v) => v.slice(5)} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "hsl(220,10%,50%)" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "hsl(220,10%,50%)" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(225,14%,7%)", border: "1px solid hsl(230,12%,14%)", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "hsl(220,10%,50%)" }}
                />
                <Area yAxisId="left" type="monotone" dataKey="clicks" stroke="hsl(142,53%,43%)" fill="url(#ogClicks)" strokeWidth={2} />
                <Area yAxisId="right" type="monotone" dataKey="impressions" stroke="hsl(217,89%,61%)" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ───── Pages Tab ───── */
const PagesTab = () => {
  const { sorted, sortKey, asc, toggle } = useSortable<PageRow>(topPages, "clicks");
  const { formatNumber, formatPercent } = useMetricFormat();

  const SortHead = ({ k, label }: { k: SortKey<PageRow>; label: string }) => (
    <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => toggle(k)}>
      {label} {sortKey === k ? (asc ? "↑" : "↓") : ""}
    </TableHead>
  );

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" /> Top Pages
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <SortHead k="clicks" label="Clicks" />
              <SortHead k="impressions" label="Impressions" />
              <SortHead k="ctr" label="CTR" />
              <SortHead k="position" label="Avg Position" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((p) => (
              <TableRow key={p.url}>
                <TableCell className="font-mono text-xs text-foreground max-w-[260px] truncate">{p.url}</TableCell>
                <TableCell className="font-mono text-sm">{formatNumber(p.clicks)}</TableCell>
                <TableCell className="font-mono text-sm">{formatNumber(p.impressions)}</TableCell>
                <TableCell className="font-mono text-sm">{formatPercent(p.ctr)}</TableCell>
                <TableCell className="font-mono text-sm">{p.position.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

/* ───── Keywords Tab ───── */
const KeywordsTab = () => {
  const { sorted, sortKey, asc, toggle } = useSortable<KeywordRow>(topKeywords, "clicks");
  const { formatNumber, formatPercent } = useMetricFormat();

  const SortHead = ({ k, label }: { k: SortKey<KeywordRow>; label: string }) => (
    <TableHead className="cursor-pointer select-none hover:text-foreground" onClick={() => toggle(k)}>
      {label} {sortKey === k ? (asc ? "↑" : "↓") : ""}
    </TableHead>
  );

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Top Keywords</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <SortHead k="clicks" label="Clicks" />
              <SortHead k="impressions" label="Impressions" />
              <SortHead k="ctr" label="CTR" />
              <SortHead k="position" label="Position" />
              <TableHead>Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((kw) => (
              <TableRow key={kw.keyword}>
                <TableCell className="text-sm text-foreground font-medium">{kw.keyword}</TableCell>
                <TableCell className="font-mono text-sm">{formatNumber(kw.clicks)}</TableCell>
                <TableCell className="font-mono text-sm">{formatNumber(kw.impressions)}</TableCell>
                <TableCell className="font-mono text-sm">{formatPercent(kw.ctr)}</TableCell>
                <TableCell className="font-mono text-sm">{kw.position.toFixed(1)}</TableCell>
                <TableCell><TrendIcon trend={kw.trend} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

/* ───── Core Web Vitals Tab ───── */
const CoreWebVitalsTab = () => (
  <div className="space-y-6">
    {/* Metric cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {coreWebVitals.map((v) => (
        <Card key={v.abbr} className="glass-card">
          <CardContent className="p-5 text-center">
            <p className="text-xs text-muted-foreground mb-2">{v.metric}</p>
            <p className="font-mono text-3xl font-bold text-foreground">
              {v.value}{v.unit}
            </p>
            <Badge className={`mt-2 text-[10px] uppercase tracking-wider border ${ratingColor(v.rating)}`}>
              {v.rating.replace("-", " ")}
            </Badge>
            <p className="text-[10px] text-muted-foreground mt-2 leading-tight">{v.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* CWV History chart */}
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Core Web Vitals — 30-Day Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cwvHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230,12%,14%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(220,10%,50%)" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(220,10%,50%)" }} />
              <Tooltip
                contentStyle={{ background: "hsl(225,14%,7%)", border: "1px solid hsl(230,12%,14%)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "hsl(220,10%,50%)" }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="lcp" name="LCP (s)" stroke="hsl(142,53%,43%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="inp" name="INP (ms)" stroke="hsl(38,91%,55%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cls" name="CLS" stroke="hsl(217,89%,61%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  </div>
);

/* ───── Main Page ───── */
const Organic = () => (
  <DashboardLayout title="Organic / GSC">
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="bg-secondary">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="pages">Pages</TabsTrigger>
        <TabsTrigger value="keywords">Keywords</TabsTrigger>
        <TabsTrigger value="cwv">Core Web Vitals</TabsTrigger>
      </TabsList>

      <TabsContent value="overview"><OverviewTab /></TabsContent>
      <TabsContent value="pages"><PagesTab /></TabsContent>
      <TabsContent value="keywords"><KeywordsTab /></TabsContent>
      <TabsContent value="cwv"><CoreWebVitalsTab /></TabsContent>
    </Tabs>
  </DashboardLayout>
);

export default Organic;
