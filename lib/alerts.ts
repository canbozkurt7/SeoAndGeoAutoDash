import { createServiceSupabase } from "@/lib/supabase/server";

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
}

export async function queueEmail(email: EmailPayload) {
  const supabase = createServiceSupabase();
  await supabase.from("email_queue").insert({
    to_address: email.to,
    subject: email.subject,
    body: email.text,
    status: "queued"
  });
}

export async function sendDailyDigest(siteId: string, date: string) {
  const supabase = createServiceSupabase();
  const { data: subscribers } = await supabase
    .from("email_subscriber")
    .select("email")
    .eq("site_id", siteId)
    .eq("is_active", true);

  const { data: latest } = await supabase
    .from("geo_score_daily")
    .select("seo_score,geo_citation_score,seo_delta,geo_delta")
    .eq("site_id", siteId)
    .eq("date", date)
    .maybeSingle();

  for (const sub of subscribers ?? []) {
    await queueEmail({
      to: sub.email,
      subject: `[SEO/GEO] Daily Digest ${date}`,
      text: `SEO ${latest?.seo_score ?? "-"} (${latest?.seo_delta ?? 0}), GEO ${
        latest?.geo_citation_score ?? "-"
      } (${latest?.geo_delta ?? 0})`
    });
  }
}

export async function sendCriticalAlerts(siteId: string, date: string) {
  const supabase = createServiceSupabase();
  const { data: alerts } = await supabase
    .from("alert_event")
    .select("event_type,severity")
    .eq("site_id", siteId)
    .eq("event_date", date)
    .in("severity", ["high", "critical"])
    .eq("status", "open");

  if (!alerts?.length) {
    return;
  }

  const { data: subscribers } = await supabase
    .from("email_subscriber")
    .select("email")
    .eq("site_id", siteId)
    .eq("is_active", true);

  const body = alerts.map((a) => `${a.severity.toUpperCase()}: ${a.event_type}`).join("\n");
  for (const sub of subscribers ?? []) {
    await queueEmail({
      to: sub.email,
      subject: `[SEO/GEO] Critical Alert ${date}`,
      text: body
    });
  }
}
