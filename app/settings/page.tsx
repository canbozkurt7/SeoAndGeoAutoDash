import {
  CsvImportForm,
  SubscriberForm,
  ThresholdForm,
  TriggerPipelineButton
} from "@/components/dashboard/Actions";
import { requireRoleOrRedirect } from "@/lib/auth";
import { getCurrentSiteId } from "@/lib/request";

export default async function SettingsPage() {
  await requireRoleOrRedirect("editor");
  const siteId = await getCurrentSiteId();
  return (
    <>
      <h1 className="page-title">Settings</h1>
      <div className="grid">
        <section className="card">
          <h3>Prompt Import</h3>
          <p className="muted">CSV columns: query, intent, priority</p>
          <CsvImportForm siteId={siteId} />
        </section>
        <section className="card">
          <h3>Automation</h3>
          <p className="muted">Manual trigger for diagnostics and backfills.</p>
          <TriggerPipelineButton siteId={siteId} />
        </section>
        <section className="card">
          <h3>Alert Thresholds</h3>
          <ThresholdForm siteId={siteId} />
        </section>
        <section className="card">
          <h3>Email Recipients</h3>
          <SubscriberForm siteId={siteId} />
        </section>
        <section className="card">
          <h3>Google Integration</h3>
          <p className="muted">
            Connect using API endpoint: <code>POST /api/integrations/google/connect</code>
          </p>
          <p className="muted">
            Payload: <code>{`{ site_id, access_token, refresh_token, expires_at }`}</code>
          </p>
        </section>
      </div>
    </>
  );
}
