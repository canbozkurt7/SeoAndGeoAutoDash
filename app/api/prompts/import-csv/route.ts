import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { parsePromptCsv } from "@/lib/csv";
import { createServiceSupabase } from "@/lib/supabase/server";

const schema = z.object({
  site_id: z.string().uuid(),
  csv: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    await requireRole("editor");
    const body = await request.json();
    const payload = schema.parse(body);
    const rows = parsePromptCsv(payload.csv);

    if (!rows.length) {
      return NextResponse.json({ error: "No valid rows found" }, { status: 400 });
    }

    const supabase = createServiceSupabase();
    const { error } = await supabase.from("tracked_prompt").insert(
      rows.map((row) => ({
        site_id: payload.site_id,
        prompt_text: row.query,
        intent: row.intent ?? "informational",
        priority: row.priority ?? 3,
        is_active: true
      }))
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, imported: rows.length });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 401 });
  }
}
