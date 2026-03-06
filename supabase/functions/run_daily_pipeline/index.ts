// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const APP_BASE_URL = Deno.env.get("APP_BASE_URL");
const PIPELINE_SHARED_SECRET = Deno.env.get("PIPELINE_SHARED_SECRET");
const DEFAULT_SITE_ID = Deno.env.get("DEFAULT_SITE_ID");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (!APP_BASE_URL || !PIPELINE_SHARED_SECRET || !DEFAULT_SITE_ID) {
    return new Response(
      JSON.stringify({ error: "Missing APP_BASE_URL, PIPELINE_SHARED_SECRET, or DEFAULT_SITE_ID" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { site_id?: string; run_date?: string };
  const runDate = body.run_date ?? new Date().toISOString().slice(0, 10);
  const siteId = body.site_id ?? DEFAULT_SITE_ID;

  const response = await fetch(`${APP_BASE_URL}/api/pipeline/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-pipeline-secret": PIPELINE_SHARED_SECRET
    },
    body: JSON.stringify({
      site_id: siteId,
      run_date: runDate
    })
  });

  const text = await response.text();
  return new Response(text, {
    status: response.status,
    headers: { "Content-Type": "application/json" }
  });
});
