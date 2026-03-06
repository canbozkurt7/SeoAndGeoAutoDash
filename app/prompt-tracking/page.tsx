import { getPromptHistory, getPromptList } from "@/lib/dashboard";
import { requireRoleOrRedirect } from "@/lib/auth";
import { getCurrentSiteId } from "@/lib/request";

export default async function PromptTrackingPage() {
  await requireRoleOrRedirect("editor");
  const siteId = await getCurrentSiteId();
  const prompts = await getPromptList(siteId);
  const selected = prompts[0];
  const history = selected ? await getPromptHistory(siteId, selected.id) : [];

  return (
    <>
      <h1 className="page-title">Prompt Tracking</h1>

      <section className="card">
        <h3>Tracked Prompts</h3>
        <table>
          <thead>
            <tr>
              <th>Prompt</th>
              <th>Intent</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {prompts.map((prompt: any) => (
              <tr key={prompt.id}>
                <td>{prompt.prompt_text}</td>
                <td>{prompt.intent}</td>
                <td>{prompt.priority}</td>
                <td>{prompt.is_active ? "Active" : "Paused"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h3>Latest Citation History {selected ? `(${selected.prompt_text})` : ""}</h3>
        <table>
          <thead>
            <tr>
              <th>Run At</th>
              <th>Engine</th>
              <th>Cited Domains</th>
              <th>Mentioned Domains</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row: any) => (
              <tr key={row.response_id}>
                <td>{new Date(row.run_at).toLocaleString()}</td>
                <td>{row.engine}</td>
                <td>{(row.cited_domains ?? []).join(", ")}</td>
                <td>{(row.mention_domains ?? []).join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
