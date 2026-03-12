import { NextResponse } from "next/server";
import { z } from "zod";
import { isInternalRequest, requireRole } from "@/lib/auth";
import { runDailyPipeline } from "@/lib/pipeline";

const schema = z.object({
  site_id: z.string().uuid().optional(),
  run_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export async function POST(request: Request) {
  try {
    if (!isInternalRequest(request)) {
      await requireRole("owner");
    }
    const rawBody = await request.text();
    const parsed = rawBody ? schema.parse(JSON.parse(rawBody)) : {};
    const siteId = parsed.site_id ?? process.env.DEFAULT_SITE_ID;
    const runDate = parsed.run_date ?? new Date().toISOString().slice(0, 10);
    if (!siteId) {
      return NextResponse.json(
        { error: "DEFAULT_SITE_ID is missing and site_id was not provided" },
        { status: 400 }
      );
    }
    const result = await runDailyPipeline(siteId, runDate);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    if (!isInternalRequest(request)) {
      await requireRole("owner");
    }
    const siteId = process.env.DEFAULT_SITE_ID;
    const runDate = new Date().toISOString().slice(0, 10);
    if (!siteId) {
      return NextResponse.json({ error: "DEFAULT_SITE_ID is missing" }, { status: 400 });
    }
    const result = await runDailyPipeline(siteId, runDate);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
