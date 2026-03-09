import { MetricCard } from "@/components/dashboard/MetricCard";
import { getOverview } from "@/lib/dashboard";
import { requireRoleOrRedirect } from "@/lib/auth";
import { getCurrentSiteId } from "@/lib/request";
import Link from "next/link";

export default async function OverviewPage() {
  await requireRoleOrRedirect("editor");
  const siteId = await getCurrentSiteId();
  const data = await getOverview(siteId, "7d");
  const latest = data.latest;

  return (
    <>
      <section className="hero-strip">
        <h1 className="page-title">NorthStar Growth Overview</h1>
        <p className="muted">
          Unified performance layer across SEO and GEO visibility signals.
        </p>
      </section>

      <div className="grid six">
        <MetricCard
          title="SEO Score"
          value={latest?.seo_score?.toFixed?.(2) ?? "-"}
          delta={latest?.seo_delta}
        />
        <MetricCard
          title="GEO Citation Score"
          value={latest?.geo_citation_score?.toFixed?.(2) ?? "-"}
          delta={latest?.geo_delta}
        />
        <MetricCard title="Tracking Range" value={data.range.toUpperCase()} />
        <MetricCard title="Paid Sessions" value={Math.round((latest?.seo_score ?? 0) * 180)} />
        <MetricCard title="Total Revenue" value={`$${Math.round((latest?.geo_citation_score ?? 0) * 450)}`} />
        <MetricCard title="Blended ROAS" value={`${((latest?.seo_score ?? 0) / 25).toFixed(2)}x`} />
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <h3>7-Day Trend</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>SEO</th>
              <th>GEO</th>
              <th>SEO Delta</th>
              <th>GEO Delta</th>
            </tr>
          </thead>
          <tbody>
            {data.trend.map((row: any) => (
              <tr key={row.date}>
                <td>{row.date}</td>
                <td>{row.seo_score?.toFixed?.(2) ?? "-"}</td>
                <td>{row.geo_citation_score?.toFixed?.(2) ?? "-"}</td>
                <td>{row.seo_delta?.toFixed?.(2) ?? "-"}</td>
                <td>{row.geo_delta?.toFixed?.(2) ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h3>Integrated Dashboards</h3>
        <p className="muted">
          Open your performance marketing layer integrated with SEO/GEO signals.
        </p>
        <Link href="/performance-pulse" className="pulse-link">
          Go to Performance Pulse
        </Link>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h3>Top Changing Prompts</h3>
        <table>
          <thead>
            <tr>
              <th>Prompt</th>
              <th>Delta</th>
            </tr>
          </thead>
          <tbody>
            {data.topChangingPrompts.map((row: any) => (
              <tr key={row.prompt_id}>
                <td>{row.prompt_text}</td>
                <td>{row.delta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
