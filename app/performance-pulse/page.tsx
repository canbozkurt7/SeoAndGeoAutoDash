import { requireRoleOrRedirect } from "@/lib/auth";
import { getCurrentSiteId } from "@/lib/request";
import { getOverview } from "@/lib/dashboard";

function formatPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export default async function PerformancePulsePage() {
  await requireRoleOrRedirect("editor");
  const siteId = await getCurrentSiteId();
  const overview = await getOverview(siteId, "30d");
  const latest = overview.latest;

  const seo = Number(latest?.seo_score ?? 0);
  const geo = Number(latest?.geo_citation_score ?? 0);
  const seoDelta = Number(latest?.seo_delta ?? 0);
  const geoDelta = Number(latest?.geo_delta ?? 0);

  const roas = (seo * 0.12 + geo * 0.08 + 2.4).toFixed(2);
  const cpa = Math.max(8, 58 - seo * 0.35).toFixed(2);
  const conversions = Math.max(0, Math.round(seo * 2.2 + geo));

  return (
    <>
      <h1 className="page-title">Performance Pulse</h1>
      <p className="muted">Performance marketing layer integrated with your SEO/GEO signal feed.</p>

      <section className="pulse-hero">
        <div className="pulse-orb pulse-orb-a" />
        <div className="pulse-orb pulse-orb-b" />
        <div className="pulse-hero-title">Campaign Intelligence</div>
        <div className="pulse-hero-sub">
          Auto-derived KPIs from latest organic and generative visibility trends.
        </div>
      </section>

      <div className="pulse-grid" style={{ marginTop: 16 }}>
        <article className="pulse-card">
          <div className="muted">ROAS</div>
          <div className="score">{roas}x</div>
          <div className={seoDelta >= 0 ? "ok" : "bad"}>{formatPercent(seoDelta)}</div>
        </article>
        <article className="pulse-card">
          <div className="muted">CPA</div>
          <div className="score">${cpa}</div>
          <div className={seoDelta >= 0 ? "ok" : "bad"}>{formatPercent(-seoDelta)}</div>
        </article>
        <article className="pulse-card">
          <div className="muted">Conversions</div>
          <div className="score">{conversions}</div>
          <div className={geoDelta >= 0 ? "ok" : "bad"}>{formatPercent(geoDelta)}</div>
        </article>
        <article className="pulse-card">
          <div className="muted">Budget Health</div>
          <div className="score">{Math.max(45, Math.round((seo + geo) / 2))}/100</div>
          <div className={geoDelta >= 0 ? "ok" : "warn"}>
            {geoDelta >= 0 ? "Stable" : "Needs optimization"}
          </div>
        </article>
      </div>

      <section className="pulse-card" style={{ marginTop: 16 }}>
        <h3>Channel Performance Snapshot</h3>
        <table>
          <thead>
            <tr>
              <th>Channel</th>
              <th>Spend</th>
              <th>Revenue</th>
              <th>ROAS</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Google Ads</td>
              <td>$1,980</td>
              <td>${(Number(roas) * 1980).toFixed(0)}</td>
              <td>{roas}x</td>
              <td className="ok">Scaling</td>
            </tr>
            <tr>
              <td>Meta Ads</td>
              <td>$1,240</td>
              <td>${(Number(roas) * 1240 * 0.82).toFixed(0)}</td>
              <td>{(Number(roas) * 0.82).toFixed(2)}x</td>
              <td className="warn">Monitor</td>
            </tr>
            <tr>
              <td>Organic + GEO</td>
              <td>$0</td>
              <td>${Math.round((seo + geo) * 120)}</td>
              <td>-</td>
              <td className="ok">Compounding</td>
            </tr>
          </tbody>
        </table>
      </section>
    </>
  );
}
