import { createServiceSupabase } from "@/lib/supabase/server";

function daysForRange(range: string) {
  return range === "30d" ? 30 : 7;
}

export async function getOverview(siteId: string, range: "7d" | "30d" = "7d") {
  const supabase = createServiceSupabase();
  const days = daysForRange(range);
  const fromDate = new Date(Date.now() - days * 24 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);

  const { data: scores } = await supabase
    .from("geo_score_daily")
    .select("date,seo_score,geo_citation_score,seo_delta,geo_delta")
    .eq("site_id", siteId)
    .gte("date", fromDate)
    .order("date", { ascending: true });

  const { data: promptTrends } = await supabase
    .from("prompt_change_view")
    .select("prompt_id,prompt_text,delta")
    .eq("site_id", siteId)
    .order("delta", { ascending: false })
    .limit(8);

  return {
    range,
    latest: scores?.at(-1) ?? null,
    trend: scores ?? [],
    topChangingPrompts: promptTrends ?? []
  };
}

export async function getPromptHistory(siteId: string, promptId: string) {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("geo_observation")
    .select("run_at,engine,cited_domains,mention_domains,response_id")
    .eq("site_id", siteId)
    .eq("prompt_id", promptId)
    .order("run_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getOpenAlerts(siteId: string) {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("alert_event")
    .select("id,event_date,event_type,severity,status,created_at")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getPromptList(siteId: string) {
  const supabase = createServiceSupabase();
  const { data } = await supabase
    .from("tracked_prompt")
    .select("id,prompt_text,intent,priority,is_active,created_at")
    .eq("site_id", siteId)
    .order("created_at", { ascending: false })
    .limit(100);
  return data ?? [];
}
