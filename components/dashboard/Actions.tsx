"use client";

import { useState } from "react";

export function TriggerPipelineButton({ siteId }: { siteId: string }) {
  const [status, setStatus] = useState<string>("-");

  async function onRun() {
    setStatus("Running...");
    const runDate = new Date().toISOString().slice(0, 10);
    const response = await fetch("/api/pipeline/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_id: siteId, run_date: runDate })
    });
    const data = await response.json();
    setStatus(response.ok ? "Done" : `Failed: ${data.error}`);
  }

  return (
    <div>
      <button type="button" onClick={onRun}>
        Run Daily Pipeline Now
      </button>
      <div className="muted" style={{ marginTop: 8 }}>
        {status}
      </div>
    </div>
  );
}

export function TestAlertButton({ siteId }: { siteId: string }) {
  const [status, setStatus] = useState<string>("-");

  async function onSend() {
    setStatus("Sending...");
    const response = await fetch("/api/alerts/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_id: siteId })
    });
    const data = await response.json();
    setStatus(response.ok ? `Sent: ${data.sent}` : `Failed: ${data.error}`);
  }

  return (
    <div>
      <button type="button" onClick={onSend}>
        Send Test Alert
      </button>
      <div className="muted" style={{ marginTop: 8 }}>
        {status}
      </div>
    </div>
  );
}

export function CsvImportForm({ siteId }: { siteId: string }) {
  const [csv, setCsv] = useState("query,intent,priority\nbest ai seo tools,commercial,2");
  const [status, setStatus] = useState("-");

  async function onImport() {
    setStatus("Importing...");
    const response = await fetch("/api/prompts/import-csv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_id: siteId, csv })
    });
    const data = await response.json();
    setStatus(response.ok ? `Imported: ${data.imported}` : `Failed: ${data.error}`);
  }

  return (
    <div>
      <textarea
        rows={6}
        value={csv}
        onChange={(event) => setCsv(event.target.value)}
      />
      <button type="button" onClick={onImport} style={{ marginTop: 8 }}>
        Import CSV Prompts
      </button>
      <div className="muted" style={{ marginTop: 8 }}>
        {status}
      </div>
    </div>
  );
}

export function ThresholdForm({ siteId }: { siteId: string }) {
  const [seoDrop, setSeoDrop] = useState(8);
  const [geoDrop, setGeoDrop] = useState(10);
  const [spike, setSpike] = useState(12);
  const [status, setStatus] = useState("-");

  async function onSave() {
    setStatus("Saving...");
    const response = await fetch("/api/settings/thresholds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site_id: siteId,
        seo_drop_threshold: seoDrop,
        geo_drop_threshold: geoDrop,
        spike_threshold: spike
      })
    });
    const data = await response.json();
    setStatus(response.ok ? "Saved" : `Failed: ${data.error}`);
  }

  return (
    <div>
      <label htmlFor="seoDrop">SEO Drop Threshold</label>
      <input
        id="seoDrop"
        type="number"
        value={seoDrop}
        onChange={(e) => setSeoDrop(Number(e.target.value))}
      />
      <label htmlFor="geoDrop">GEO Drop Threshold</label>
      <input
        id="geoDrop"
        type="number"
        value={geoDrop}
        onChange={(e) => setGeoDrop(Number(e.target.value))}
      />
      <label htmlFor="spike">Positive Spike Threshold</label>
      <input
        id="spike"
        type="number"
        value={spike}
        onChange={(e) => setSpike(Number(e.target.value))}
      />
      <button type="button" onClick={onSave} style={{ marginTop: 8 }}>
        Save Thresholds
      </button>
      <div className="muted" style={{ marginTop: 8 }}>
        {status}
      </div>
    </div>
  );
}

export function SubscriberForm({ siteId }: { siteId: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("-");

  async function onAdd() {
    setStatus("Adding...");
    const response = await fetch("/api/settings/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site_id: siteId, email })
    });
    const data = await response.json();
    setStatus(response.ok ? `Added ${data.subscriber.email}` : `Failed: ${data.error}`);
  }

  return (
    <div>
      <input
        type="email"
        value={email}
        placeholder="alerts@domain.com"
        onChange={(event) => setEmail(event.target.value)}
      />
      <button type="button" onClick={onAdd} style={{ marginTop: 8 }}>
        Add Recipient
      </button>
      <div className="muted" style={{ marginTop: 8 }}>
        {status}
      </div>
    </div>
  );
}
