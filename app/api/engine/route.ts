import { NextResponse } from "next/server";
import { engineStatus } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = engineStatus();
  return NextResponse.json({
    ...s,
    host: process.env.VERCEL ? "vercel" : "local",
    extract: "/api/extract",
  });
}
