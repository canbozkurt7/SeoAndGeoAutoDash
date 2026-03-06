import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { getOverview } from "@/lib/dashboard";
import { resolveSiteIdFromRequest } from "@/lib/request";

const rangeSchema = z.enum(["7d", "30d"]);

export async function GET(request: Request) {
  try {
    await requireRole("editor");
    const siteId = await resolveSiteIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const range = rangeSchema.parse(searchParams.get("range") ?? "7d");
    const data = await getOverview(siteId, range);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 401 });
  }
}
