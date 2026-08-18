import { NextResponse } from "next/server";
import { classifyText } from "@/lib/classify";
import { extractToClassification } from "@/lib/extract-schema";
import { llmExtract } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string };
    const text = (body.text ?? "").trim();
    if (text.length < 8) {
      return NextResponse.json({ error: "Quote too short." }, { status: 400 });
    }
    const { extract, runtime, ms } = await llmExtract(text);
    const lexical = classifyText(text);
    const classification = extractToClassification(text, extract, lexical, runtime);
    return NextResponse.json({
      ...classification,
      runtime: { provider: runtime.provider, model: runtime.model, ms, via: "POST /api/extract" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Extract failed";
    const hint = /credit card/i.test(msg)
      ? " Add GROQ_API_KEY on the Vercel project (free at console.groq.com), or add a card to unlock AI Gateway credits. No keyword fallback."
      : "";
    return NextResponse.json({ error: msg + hint }, { status: 500 });
  }
}
