import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createServiceSupabase } from "@/lib/supabase/server";
import { resolveSiteIdFromRequest } from "@/lib/request";

const createSchema = z.object({
  site_id: z.string().uuid(),
  email: z.string().email()
});

export async function GET(request: Request) {
  try {
    await requireRole("editor");
    const siteId = await resolveSiteIdFromRequest(request);
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("email_subscriber")
      .select("id,email,is_active,created_at")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ subscribers: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole("owner");
    const payload = createSchema.parse(await request.json());
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("email_subscriber")
      .upsert(
        {
          site_id: payload.site_id,
          email: payload.email,
          is_active: true
        },
        { onConflict: "site_id,email" }
      )
      .select("id,email,is_active")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ subscriber: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole("owner");
    const payload = z
      .object({
        id: z.string().uuid(),
        is_active: z.boolean()
      })
      .parse(await request.json());
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("email_subscriber")
      .update({ is_active: payload.is_active })
      .eq("id", payload.id)
      .select("id,email,is_active")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ subscriber: data });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 401 });
  }
}
