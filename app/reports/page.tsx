import { getOverview } from "@/lib/dashboard";
import { getCurrentSiteId } from "@/lib/request";
import { requireRoleOrRedirect } from "@/lib/auth";

function lastDateLabel(dateText?: string) {
  if (!dateText) return "-";
  return new Date(dateText).toLocaleDateString("en-GB");
}

export default async function ReportsPage() {
  await requireRoleOrRedirect("editor");
  const siteId = await getCurrentSiteId();
  const data = await getOverview(siteId, "30d");
  const latest = (data as any).latest ?? { date: "", seo_score: 0, geo_citation_score: 0 };
  const prompts = (data as any).topChangingPrompts ?? [];

  return (
    <div className="ns-wrap">
      <section className="ns-card">
        <h1 className="page-title">Reports</h1>
        <p className="muted">Summary snapshots and scheduled report preview.</p>
      </section>

      <div className="ns-kpi-grid" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
        <article className="ns-card">
          <p className="ns-kpi-label">Last Snapshot Date</p>
          <div className="ns-kpi-value">{lastDateLabel(latest.date)}</div>
        </article>
        <article className="ns-card">
          <p className="ns-kpi-label">SEO Score</p>
          <div className="ns-kpi-value">{Math.round(latest.seo_score ?? 0)}</div>
        </article>
        <article className="ns-card">
          <p className="ns-kpi-label">GEO Citation Score</p>
          <div className="ns-kpi-value">{Math.round(latest.geo_citation_score ?? 0)}</div>
        </article>
      </div>

      <section className="ns-card ns-table">
        <div className="ns-table-head">
          <h3>Top Changing Prompts</h3>
          <span className="muted">From current 30-day window</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Prompt</th>
              <th>Delta</th>
            </tr>
          </thead>
          <tbody>
            {prompts.length > 0 ? (
              prompts.map((row: any) => (
                <tr key={row.prompt_id}>
                  <td>{row.prompt_text}</td>
                  <td className={Number(row.delta ?? 0) >= 0 ? "ok" : "bad"}>
                    {Number(row.delta ?? 0) >= 0 ? "+" : ""}
                    {Number(row.delta ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="muted">
                  No prompt trend data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
