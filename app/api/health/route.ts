import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "seo-geo-dashboard",
    timestamp: new Date().toISOString()
  });
}
