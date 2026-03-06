import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { queueEmail } from "@/lib/alerts";
import { createServiceSupabase } from "@/lib/supabase/server";

const schema = z.object({
  site_id: z.string().uuid()
});

export async function POST(request: Request) {
  try {
    await requireRole("owner");
    const body = await request.json();
    const payload = schema.parse(body);
    const supabase = createServiceSupabase();

    const { data: subscribers } = await supabase
      .from("email_subscriber")
      .select("email")
      .eq("site_id", payload.site_id)
      .eq("is_active", true);

    for (const subscriber of subscribers ?? []) {
      await queueEmail({
        to: subscriber.email,
        subject: "[SEO/GEO] Test Alert",
        text: "This is a test alert from your SEO/GEO automation dashboard."
      });
    }
    return NextResponse.json({ ok: true, sent: subscribers?.length ?? 0 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 401 });
  }
}
