import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createServiceSupabase } from "@/lib/supabase/server";

const schema = z.object({
  site_id: z.string().uuid(),
  access_token: z.string().min(8),
  refresh_token: z.string().min(8),
  expires_at: z.string().optional()
});

export async function POST(request: Request) {
  try {
    await requireRole("owner");
    const body = await request.json();
    const payload = schema.parse(body);
    const supabase = createServiceSupabase();

    const { error } = await supabase.from("integration_account").upsert(
      {
        site_id: payload.site_id,
        provider: "google",
        access_token: payload.access_token,
        refresh_token: payload.refresh_token,
        expires_at: payload.expires_at ?? null
      },
      { onConflict: "site_id,provider" }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 401 });
  }
}
