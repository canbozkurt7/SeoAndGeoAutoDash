"use client";

import { useState } from "react";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ArrowUpDown } from "lucide-react";

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
  const trend14 = overview.trend.slice(-14);

  const campaigns = overview.topChangingPrompts.map((p, i) => ({
    id: p.prompt_id,
    platform: i % 3 === 0 ? "google" : i % 3 === 1 ? "meta" : "yandex",
    name: p.prompt_text,
    status: p.delta >= 0 ? "Active" : "Monitor",
    delta: p.delta,
    days: trend14.map((d, idx) => {
      const factor = 0.85 + i * 0.11;
      const conv = Math.max(1, Math.round((d.geo_citation_score * 0.7 + d.seo_score * 0.4) * factor));
      const impressions = Math.max(100, Math.round((d.seo_score * 340 + 5000 + idx * 45) * factor));
      const clicks = Math.max(10, Math.round((d.geo_citation_score * 38 + d.seo_score * 11 + 90) * factor));
      const cpa = Number((15 + (100 - d.seo_score) * 0.3 + i * 0.9).toFixed(2));
      const ctr = Number(((clicks / impressions) * 100).toFixed(2));
      return {
        date: d.date.slice(5),
        conversions: conv,
        impressions,
        clicks,
        cpa,
        ctr
      };
    })
  }));

  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id ?? "");
  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId) ?? campaigns[0];

  const latest = selectedCampaign?.days.at(-1) ?? {
    conversions: 0,
    impressions: 0,
    clicks: 0,
    cpa: 0,
    ctr: 0
  };

  const tableRows = campaigns.map((c) => {
    const last = c.days.at(-1) ?? { impressions: 0, clicks: 0, conversions: 0 };
    const ctr = last.impressions > 0 ? (last.clicks / last.impressions) * 100 : 0;
    return { ...c, impressions: last.impressions, clicks: last.clicks, conversions: last.conversions, ctr };
  });

  return (
    <div className="ns-wrap">
      <section className="ns-card">
        <h3>Overview (14 Days)</h3>
        <p className="muted">
          Selected campaign: <strong>{selectedCampaign?.name ?? "No campaign"}</strong>
        </p>
      </section>

      <div className="ns-kpi-grid" style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))" }}>
        <article className="ns-card ns-kpi">
          <p className="ns-kpi-label">Conversions</p>
          <div className="ns-kpi-value">{latest.conversions}</div>
          <div className="ns-spark">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedCampaign?.days ?? []}>
                <Line type="monotone" dataKey="conversions" stroke="#6ea8ff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="ns-card ns-kpi">
          <p className="ns-kpi-label">Impressions</p>
          <div className="ns-kpi-value">{latest.impressions}</div>
          <div className="ns-spark">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedCampaign?.days ?? []}>
                <Line type="monotone" dataKey="impressions" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="ns-card ns-kpi">
          <p className="ns-kpi-label">CPA</p>
          <div className="ns-kpi-value">${n(latest.cpa, 2)}</div>
          <div className="ns-spark">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedCampaign?.days ?? []}>
                <Line type="monotone" dataKey="cpa" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="ns-card ns-kpi">
          <p className="ns-kpi-label">CTR</p>
          <div className="ns-kpi-value">{n(latest.ctr, 2)}%</div>
          <div className="ns-spark">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedCampaign?.days ?? []}>
                <Line type="monotone" dataKey="ctr" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="ns-row" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <section className="ns-card ns-chart">
          <h3>Impressions (14d)</h3>
          <div className="ns-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedCampaign?.days ?? []}>
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
                <Line type="monotone" dataKey="impressions" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="ns-card ns-chart">
          <h3>Clicks (14d)</h3>
          <div className="ns-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedCampaign?.days ?? []}>
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
                <Line type="monotone" dataKey="clicks" stroke="#60a5fa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="ns-card ns-table">
        <div className="ns-table-head">
          <h3>Impressions / Clicks Table (14d latest)</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Impressions</th>
              <th>Clicks</th>
            </tr>
          </thead>
          <tbody>
            {(selectedCampaign?.days ?? []).map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td>{d.impressions}</td>
                <td>{d.clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="ns-card ns-table">
        <div className="ns-table-head">
          <h3>Campaigns</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Platform</th>
              <th>Campaign</th>
              <th>Status</th>
              <th>
                Delta <ArrowUpDown size={12} />
              </th>
              <th>Impr.</th>
              <th>Clicks</th>
              <th>Conv.</th>
              <th>CTR</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelectedCampaignId(row.id)}
                style={{
                  cursor: "pointer",
                  background:
                    row.id === selectedCampaign?.id ? "rgba(59,130,246,0.12)" : "transparent"
                }}
              >
                <td>
                  <span className={`plat ${row.platform}`}>{row.platform.slice(0, 1).toUpperCase()}</span>
                </td>
                <td>{row.name}</td>
                <td>{row.status}</td>
                <td className={row.delta >= 0 ? "ok" : "bad"}>{pct(row.delta)}</td>
                <td>{row.impressions}</td>
                <td>{row.clicks}</td>
                <td>{row.conversions}</td>
                <td>{n(row.ctr, 2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
