import { getOpenAlerts } from "@/lib/dashboard";
import { TestAlertButton } from "@/components/dashboard/Actions";
import { requireRoleOrRedirect } from "@/lib/auth";
import { getCurrentSiteId } from "@/lib/request";

export default async function AlertsPage() {
  await requireRoleOrRedirect("editor");
  const siteId = await getCurrentSiteId();
  const alerts = await getOpenAlerts(siteId);

  return (
    <>
      <h1 className="page-title">Alerts</h1>
      <div className="grid">
        <div className="card">
          <h3>Test Notifications</h3>
          <TestAlertButton siteId={siteId} />
        </div>
      </div>
      <section className="card" style={{ marginTop: 16 }}>
        <h3>Recent Alerts</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Severity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert: any) => (
              <tr key={alert.id}>
                <td>{alert.event_date}</td>
                <td>{alert.event_type}</td>
                <td>{alert.severity}</td>
                <td>{alert.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
