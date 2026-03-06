import { NextResponse } from "next/server";
import { z } from "zod";
import { isInternalRequest, requireRole } from "@/lib/auth";
import { runDailyPipeline } from "@/lib/pipeline";

const schema = z.object({
  site_id: z.string().uuid(),
  run_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export async function POST(request: Request) {
  try {
    if (!isInternalRequest(request)) {
      await requireRole("owner");
    }
    const payload = schema.parse(await request.json());
    const result = await runDailyPipeline(payload.site_id, payload.run_date);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
