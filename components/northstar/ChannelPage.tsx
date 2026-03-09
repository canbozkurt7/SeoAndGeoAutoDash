"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type TrendRow = {
  date: string;
  seo_score: number;
  geo_citation_score: number;
  seo_delta: number;
  geo_delta: number;
};

type Props = {
  title: string;
  channel: "google" | "meta" | "yandex" | "organic";
  trend: TrendRow[];
};

function m(v: number) {
  return Math.round(v).toLocaleString();
}

export function ChannelPage({ title, channel, trend }: Props) {
  const coeff =
    channel === "google" ? 1 : channel === "meta" ? 0.84 : channel === "yandex" ? 0.62 : 0.48;
  const tone =
    channel === "google"
      ? "#4285F4"
      : channel === "meta"
      ? "#0081FB"
      : channel === "yandex"
      ? "#FC3F1D"
      : "#34A853";

  const data = trend.map((d) => ({
    date: d.date.slice(5),
    spend: Math.round((d.seo_score * 110 + d.geo_citation_score * 44) * coeff),
    revenue: Math.round((d.seo_score * 170 + d.geo_citation_score * 88) * coeff),
    clicks: Math.round((d.seo_score * 52 + d.geo_citation_score * 18) * coeff),
    conv: Math.max(1, Math.round((d.seo_score * 0.9 + d.geo_citation_score * 0.5) * coeff))
  }));

  const latest = data[data.length - 1] ?? { spend: 0, revenue: 0, clicks: 0, conv: 0 };

  return (
    <div className="ns-wrap">
      <section className="ns-card">
        <h1 className="page-title">{title}</h1>
        <p className="muted">Performance view for {title} integrated into the SEO/GEO core.</p>
      </section>

      <div className="ns-kpi-grid" style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))" }}>
        <article className="ns-card">
          <p className="ns-kpi-label">Spend</p>
          <div className="ns-kpi-value">${m(latest.spend)}</div>
        </article>
        <article className="ns-card">
          <p className="ns-kpi-label">Revenue</p>
          <div className="ns-kpi-value">${m(latest.revenue)}</div>
        </article>
        <article className="ns-card">
          <p className="ns-kpi-label">Clicks</p>
          <div className="ns-kpi-value">{m(latest.clicks)}</div>
        </article>
        <article className="ns-card">
          <p className="ns-kpi-label">Conversions</p>
          <div className="ns-kpi-value">{m(latest.conv)}</div>
        </article>
      </div>

      <section className="ns-card ns-chart">
        <h3>{title} - Last 30 Days</h3>
        <div className="ns-chart-area">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
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
              <Area type="monotone" dataKey="revenue" stroke={tone} fill={`${tone}33`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
