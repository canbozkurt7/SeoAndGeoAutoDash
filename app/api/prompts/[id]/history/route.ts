import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getPromptHistory } from "@/lib/dashboard";
import { resolveSiteIdFromRequest } from "@/lib/request";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("editor");
    const params = await context.params;
    const siteId = await resolveSiteIdFromRequest(request);
    const data = await getPromptHistory(siteId, params.id);
    return NextResponse.json({ prompt_id: params.id, history: data });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 401 });
  }
}
