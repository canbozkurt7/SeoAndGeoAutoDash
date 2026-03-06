import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createServiceSupabase } from "@/lib/supabase/server";
import { resolveSiteIdFromRequest } from "@/lib/request";

const schema = z.object({
  site_id: z.string().uuid(),
  seo_drop_threshold: z.number().min(1).max(100),
  geo_drop_threshold: z.number().min(1).max(100),
  spike_threshold: z.number().min(1).max(100)
});

export async function GET(request: Request) {
  try {
    await requireRole("editor");
    const siteId = await resolveSiteIdFromRequest(request);
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("site")
      .select("seo_drop_threshold,geo_drop_threshold,spike_threshold")
      .eq("id", siteId)
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole("owner");
    const payload = schema.parse(await request.json());
    const { site_id, ...thresholds } = payload;
    const supabase = createServiceSupabase();
    const { error } = await supabase
      .from("site")
      .update(thresholds)
      .eq("id", site_id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 401 });
  }
}
