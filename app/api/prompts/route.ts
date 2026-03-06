import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createServiceSupabase } from "@/lib/supabase/server";
import { resolveSiteIdFromRequest } from "@/lib/request";

const createSchema = z.object({
  site_id: z.string().uuid(),
  prompt_text: z.string().min(3),
  intent: z.string().default("informational"),
  priority: z.number().int().min(1).max(5).default(3)
});

const updateSchema = z.object({
  id: z.string().uuid(),
  prompt_text: z.string().min(3).optional(),
  intent: z.string().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  is_active: z.boolean().optional()
});

export async function GET(request: Request) {
  try {
    await requireRole("editor");
    const siteId = await resolveSiteIdFromRequest(request);
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("tracked_prompt")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ prompts: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireRole("editor");
    const payload = createSchema.parse(await request.json());
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("tracked_prompt")
      .insert({ ...payload, is_active: true })
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ prompt: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireRole("editor");
    const payload = updateSchema.parse(await request.json());
    const supabase = createServiceSupabase();
    const { id, ...changes } = payload;
    const { data, error } = await supabase
      .from("tracked_prompt")
      .update(changes)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ prompt: data });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireRole("owner");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Prompt id is required" }, { status: 400 });
    }
    const supabase = createServiceSupabase();
    const { error } = await supabase.from("tracked_prompt").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 401 });
  }
}
