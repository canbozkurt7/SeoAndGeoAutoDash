import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const APP_BASE_URL = Deno.env.get("APP_BASE_URL");
const PIPELINE_SHARED_SECRET = Deno.env.get("PIPELINE_SHARED_SECRET");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  if (!APP_BASE_URL || !PIPELINE_SHARED_SECRET) {
    return new Response(
      JSON.stringify({ error: "Missing APP_BASE_URL or PIPELINE_SHARED_SECRET" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const response = await fetch(`${APP_BASE_URL}/api/email/flush`, {
    method: "POST",
    headers: {
      "x-pipeline-secret": PIPELINE_SHARED_SECRET
    }
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: { "Content-Type": "application/json" }
  });
});
