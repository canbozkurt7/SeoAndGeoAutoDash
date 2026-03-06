import { createServerSupabase } from "@/lib/supabase/server";

export async function getCurrentSiteId() {
  const supabase = await createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("site_member")
    .select("site_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error("No site linked to the current user");
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
