"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

type TrendRow = {
  date: string;
  seo_score: number;
  geo_citation_score: number;
  seo_delta: number;
  geo_delta: number;
};

type PromptRow = {
  prompt_id: string;
  prompt_text: string;
  delta: number;
};

type OverviewPayload = {
  latest: {
    seo_score: number;
    geo_citation_score: number;
    seo_delta: number;
    geo_delta: number;
  } | null;
  trend: TrendRow[];
  topChangingPrompts: PromptRow[];
};

type Props = {
  overview: OverviewPayload;
};

function n(value: number, digits = 0) {
  return Number.isFinite(value) ? value.toFixed(digits) : "-";
}

function pct(value: number) {
  return `${value >= 0 ? "+" : ""}${n(value, 1)}%`;
}

export function NorthStarOverview({ overview }: Props) {
  const latest = overview.latest ?? {
    seo_score: 0,
    geo_citation_score: 0,
    seo_delta: 0,
    geo_delta: 0
  };

  const kpis = useMemo(
    () => [
      {
        label: "Total Spend",
        value: `$${Math.round(latest.seo_score * 130 + 4200)}`,
        change: latest.seo_delta,
        spark: overview.trend.map((d) => d.seo_score * 90)
      },
      {
        label: "Total Revenue",
        value: `$${Math.round(latest.geo_citation_score * 230 + 9200)}`,
        change: latest.geo_delta,
        spark: overview.trend.map((d) => d.geo_citation_score * 120)
      },
      {
        label: "Blended ROAS",
        value: `${n((latest.seo_score + latest.geo_citation_score) / 40, 2)}x`,
        change: latest.seo_delta * 0.7,
        spark: overview.trend.map((d) => (d.seo_score + d.geo_citation_score) / 2.5)
      },
      {
        label: "Total Conversions",
        value: `${Math.round(latest.seo_score * 2.4 + latest.geo_citation_score * 0.9)}`,
        change: latest.geo_delta,
        spark: overview.trend.map((d) => d.seo_score + d.geo_citation_score)
      },
      {
        label: "Paid Sessions",
        value: `${Math.round(latest.seo_score * 190)}`,
        change: latest.seo_delta * 0.6,
        spark: overview.trend.map((d) => d.seo_score * 2.1)
      },
      {
        label: "Organic Sessions",
        value: `${Math.round(latest.geo_citation_score * 170)}`,
        change: latest.geo_delta * 0.6,
        spark: overview.trend.map((d) => d.geo_citation_score * 2.2)
      }
    ],
    [latest.geo_citation_score, latest.geo_delta, latest.seo_delta, latest.seo_score, overview.trend]
  );

  const channelData = overview.trend.map((d) => ({
    date: d.date.slice(5),
    googleRev: Math.round(d.seo_score * 140),
    metaRev: Math.round(d.geo_citation_score * 120),
    yandexRev: Math.round((d.seo_score * 0.55 + d.geo_citation_score * 0.35) * 100)
  }));

  const spendMix = [
    { name: "Google", value: Math.max(1, Math.round(latest.seo_score * 110)) },
    { name: "Meta", value: Math.max(1, Math.round(latest.geo_citation_score * 100)) },
    {
      name: "Yandex",
      value: Math.max(1, Math.round((latest.seo_score * 0.45 + latest.geo_citation_score * 0.3) * 80))
    }
  ];
  const totalSpend = spendMix.reduce((a, b) => a + b.value, 0);
  const colors = ["#4285F4", "#0081FB", "#FC3F1D"];

  const tableRows = overview.topChangingPrompts.map((p, i) => ({
    id: p.prompt_id,
    platform: i % 3 === 0 ? "google" : i % 3 === 1 ? "meta" : "yandex",
    name: p.prompt_text,
    status: p.delta >= 0 ? "Active" : "Monitor",
    spend: Math.round(900 + Math.abs(p.delta) * 140),
    impressions: Math.round(18000 + Math.abs(p.delta) * 2200),
    clicks: Math.round(1200 + Math.abs(p.delta) * 130),
    conversions: Math.max(1, Math.round(28 + p.delta * 3)),
    roas: Math.max(0.8, 2.1 + p.delta / 9)
  }));

  return (
    <div className="ns-wrap">
      <div className="ns-kpi-grid">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="ns-card ns-kpi">
            <p className="ns-kpi-label">{kpi.label}</p>
            <div className="ns-kpi-value">{kpi.value}</div>
            <div className={kpi.change >= 0 ? "ok" : "bad"}>{pct(kpi.change)}</div>
            <div className="ns-spark">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpi.spark.map((v, i) => ({ i, v }))}>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#6ea8ff"
                    fill="rgba(66,133,244,0.2)"
                    strokeWidth={1.4}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>
        ))}
      </div>

      <div className="ns-row">
        <section className="ns-card ns-chart">
          <h3>Channel Performance - Last 30 Days</h3>
          <div className="ns-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fill: "#8c97ad", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8c97ad", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#10151f",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    color: "#e6ecf8"
                  }}
                />
                <Area type="monotone" dataKey="googleRev" stroke="#4285F4" fill="rgba(66,133,244,0.18)" strokeWidth={2} />
                <Area type="monotone" dataKey="metaRev" stroke="#0081FB" fill="rgba(0,129,251,0.12)" strokeWidth={2} />
                <Area type="monotone" dataKey="yandexRev" stroke="#FC3F1D" fill="rgba(252,63,29,0.12)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="ns-card ns-donut">
          <h3>Spend Distribution</h3>
          <div className="ns-donut-area">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={spendMix} cx="50%" cy="50%" innerRadius={70} outerRadius={98} paddingAngle={3} dataKey="value">
                  {spendMix.map((_, i) => (
                    <Cell key={i} fill={colors[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="ns-donut-center">
              <div className="muted">Total Spend</div>
              <div className="ns-kpi-value">${Math.round(totalSpend)}</div>
            </div>
          </div>
          <div className="ns-legend">
            {spendMix.map((d, i) => (
              <span key={d.name}>
                <i style={{ background: colors[i] }} />
                {d.name}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="ns-card ns-table">
        <div className="ns-table-head">
          <h3>Campaign Performance</h3>
          <div className="ns-search">
            <Search size={13} />
            <span>Search campaigns...</span>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Platform</th>
              <th>Campaign</th>
              <th>Status</th>
              <th>
                Spend <ArrowUpDown size={12} />
              </th>
              <th>Impr.</th>
              <th>Clicks</th>
              <th>Conv.</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className={`plat ${row.platform}`}>{row.platform.slice(0, 1).toUpperCase()}</span>
                </td>
                <td>{row.name}</td>
                <td>{row.status}</td>
                <td>${row.spend}</td>
                <td>{row.impressions}</td>
                <td>{row.clicks}</td>
                <td>{row.conversions}</td>
                <td className={row.roas >= 3 ? "ok" : row.roas >= 2 ? "warn" : "bad"}>{n(row.roas, 2)}x</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ns-pagination">
          <span>{tableRows.length} campaigns</span>
          <div>
            <button>
              <ChevronLeft size={14} />
            </button>
            <button>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
