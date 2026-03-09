import { useState, useMemo } from "react";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { campaigns, getCTR, getCPC, getConvRate, getROAS } from "@/data/mockData";
import { useMetricFormat } from "@/hooks/useMetricFormat";

type SortKey = "spend" | "impressions" | "clicks" | "conversions" | "revenue" | "ctr" | "cpc" | "convRate" | "roas";

const platformBadge: Record<string, { label: string; class: string }> = {
  google: { label: "G", class: "bg-google/20 text-google" },
  meta: { label: "M", class: "bg-meta/20 text-meta" },
  yandex: { label: "Y", class: "bg-yandex/20 text-yandex" },
};

export const CampaignTable = () => {
  const { formatNumber, formatCurrency, formatPercent, formatROAS } = useMetricFormat();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const perPage = 10;

  const enriched = useMemo(
    () =>
      campaigns.map((c) => ({
        ...c,
        ctr: getCTR(c.clicks, c.impressions),
        cpc: getCPC(c.spend, c.clicks),
        convRate: getConvRate(c.conversions, c.clicks),
        roas: getROAS(c.revenue, c.spend),
      })),
    []
  );

  const filtered = useMemo(() => {
    let items = enriched.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    items.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return items;
  }, [enriched, search, sortKey, sortAsc]);

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const roasColor = (r: number) => (r > 4 ? "text-emerald-400" : r > 2 ? "text-amber-400" : "text-red-400");

  const SortHeader = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="px-3 py-3 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
      onClick={() => handleSort(k)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className="w-3 h-3" />
      </span>
    </th>
  );

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between gap-4">
        <h3 className="font-heading text-sm font-semibold text-foreground">Campaign Performance</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-8 pr-3 py-1.5 rounded-md bg-surface-1 border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-52"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Platform</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Campaign</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
              <SortHeader label="Spend" k="spend" />
              <SortHeader label="Impr." k="impressions" />
              <SortHeader label="Clicks" k="clicks" />
              <SortHeader label="CTR" k="ctr" />
              <SortHeader label="CPC" k="cpc" />
              <SortHeader label="Conv." k="conversions" />
              <SortHeader label="Conv.%" k="convRate" />
              <SortHeader label="ROAS" k="roas" />
            </tr>
          </thead>
          <tbody>
            {paged.map((c) => {
              const badge = platformBadge[c.platform];
              return (
                <tr key={c.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold ${badge.class}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-foreground font-medium max-w-[200px] truncate">{c.name}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === "Active" ? "bg-emerald-400" : "bg-muted-foreground"}`} />
                      <span className="text-muted-foreground">{c.status}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-foreground">{formatCurrency(c.spend)}</td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatNumber(c.impressions)}</td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatNumber(c.clicks)}</td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatPercent(c.ctr)}</td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatCurrency(c.cpc)}</td>
                  <td className="px-3 py-2.5 font-mono text-foreground">{formatNumber(c.conversions)}</td>
                  <td className="px-3 py-2.5 font-mono text-muted-foreground">{formatPercent(c.convRate)}</td>
                  <td className={`px-3 py-2.5 font-mono font-medium ${roasColor(c.roas)}`}>{formatROAS(c.roas)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-border">
        <p className="text-xs text-muted-foreground">
          {filtered.length} campaigns
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="p-1 rounded hover:bg-surface-hover disabled:opacity-30 text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="p-1 rounded hover:bg-surface-hover disabled:opacity-30 text-muted-foreground"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
