import { createServerSupabase } from "@/lib/supabase/server";
import { isAuthBypassed } from "@/lib/auth";

const FALLBACK_SITE_ID =
  process.env.DEFAULT_SITE_ID ?? "00000000-0000-0000-0000-000000000001";

export async function getCurrentSiteId() {
  if (isAuthBypassed()) {
    return FALLBACK_SITE_ID;
  }

  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return FALLBACK_SITE_ID;
  }

  const { data, error } = await supabase
    .from("site_member")
    .select("site_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    return FALLBACK_SITE_ID;
  }

  return data.site_id as string;
}

export async function resolveSiteIdFromRequest(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteFromQuery = searchParams.get("site_id");
  if (siteFromQuery) {
    return siteFromQuery;
  }
  return getCurrentSiteId();
}
