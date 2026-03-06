import { NextResponse } from "next/server";
import { isInternalRequest, requireRole } from "@/lib/auth";
import { flushEmailQueue } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    if (!isInternalRequest(request)) {
      await requireRole("owner");
    }
    const result = await flushEmailQueue();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
