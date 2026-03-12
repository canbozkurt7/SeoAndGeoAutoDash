import { getOverview } from "@/lib/dashboard";
import { getCurrentSiteId } from "@/lib/request";
import { requireRoleOrRedirect } from "@/lib/auth";

function avg(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export default async function GeoIntelligencePage() {
  await requireRoleOrRedirect("editor");
  const siteId = await getCurrentSiteId();
  const data = await getOverview(siteId, "30d");
  const trend = (data as any).trend ?? [];
  const latest = (data as any).latest ?? { geo_citation_score: 0, geo_delta: 0 };

  const split = [
    { region: "North America", share: 34 },
    { region: "Europe", share: 27 },
    { region: "CIS", share: 15 },
    { region: "APAC", share: 17 },
    { region: "LATAM", share: 7 }
  ];

  const avgGeo = avg(trend.map((t: any) => t.geo_citation_score ?? 0));
  const avgSeo = avg(trend.map((t: any) => t.seo_score ?? 0));

  return (
    <div className="ns-wrap">
      <section className="ns-card">
        <h1 className="page-title">Geo Intelligence</h1>
        <p className="muted">Regional LLM citation visibility and market mix overview.</p>
      </section>

      <div className="ns-kpi-grid" style={{ gridTemplateColumns: "repeat(4,minmax(0,1fr))" }}>
        <article className="ns-card">
          <p className="ns-kpi-label">Current GEO Score</p>
          <div className="ns-kpi-value">{Math.round(latest.geo_citation_score ?? 0)}</div>
        </article>
        <article className="ns-card">
          <p className="ns-kpi-label">30d Avg GEO</p>
          <div className="ns-kpi-value">{Math.round(avgGeo)}</div>
        </article>
        <article className="ns-card">
          <p className="ns-kpi-label">30d Avg SEO</p>
          <div className="ns-kpi-value">{Math.round(avgSeo)}</div>
        </article>
        <article className="ns-card">
          <p className="ns-kpi-label">Daily Delta</p>
          <div className={`ns-kpi-value ${(latest.geo_delta ?? 0) >= 0 ? "ok" : "bad"}`}>
            {(latest.geo_delta ?? 0) >= 0 ? "+" : ""}
            {Number(latest.geo_delta ?? 0).toFixed(2)}%
          </div>
        </article>
      </div>

      <section className="ns-card ns-table">
        <div className="ns-table-head">
          <h3>Region Mix</h3>
          <span className="muted">Estimated visibility distribution</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Region</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {split.map((r) => (
              <tr key={r.region}>
                <td>{r.region}</td>
                <td>{r.share}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
