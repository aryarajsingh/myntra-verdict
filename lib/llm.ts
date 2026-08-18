import "server-only";
import { generateText, Output, NoObjectGeneratedError, type LanguageModel } from "ai";
import { EXTRACT_PROMPT } from "@/data/extract-prompt";
import { applyPolicy, ExtractObjectSchema, parseExtractJson, type ExtractObject } from "@/lib/extract-schema";

/** Groq retired llama-3.3-70b-versatile on 2026-08-16. Replacement is GPT-OSS 120B. */
const GROQ_CHAT_MODEL = process.env.WHYWAIT_GROQ_MODEL || "openai/gpt-oss-120b";
const GATEWAY_MODEL = (process.env.WHYWAIT_MODEL || `groq/${GROQ_CHAT_MODEL}`) as LanguageModel;

export type LlmRuntime = {
  provider: string;
  model: string;
};

export function engineStatus(): LlmRuntime & { live: boolean } {
  if (process.env.GROQ_API_KEY) {
    return { live: true, provider: "groq", model: GROQ_CHAT_MODEL };
  }
  if (process.env.OPENAI_API_KEY) {
    return { live: true, provider: "openai", model: "gpt-4o-mini" };
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return { live: true, provider: "anthropic", model: "claude-sonnet-4-5" };
  }
  if (process.env.VERCEL === "1" || process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) {
    return { live: true, provider: "vercel-gateway", model: String(GATEWAY_MODEL) };
  }
  return { live: false, provider: "none", model: "unset" };
}

async function resolveModel(): Promise<{ runtime: LlmRuntime; model: LanguageModel }> {
  if (process.env.GROQ_API_KEY) {
    const { createGroq } = await import("@ai-sdk/groq");
    return {
      runtime: { provider: "groq", model: GROQ_CHAT_MODEL },
      model: createGroq({ apiKey: process.env.GROQ_API_KEY })(GROQ_CHAT_MODEL),
    };
  }
  if (process.env.OPENAI_API_KEY) {
    const { createOpenAI } = await import("@ai-sdk/openai");
    return {
      runtime: { provider: "openai", model: "gpt-4o-mini" },
      model: createOpenAI({ apiKey: process.env.OPENAI_API_KEY })("gpt-4o-mini"),
    };
  }
  if (process.env.ANTHROPIC_API_KEY) {
    const { createAnthropic } = await import("@ai-sdk/anthropic");
    return {
      runtime: { provider: "anthropic", model: "claude-sonnet-4-5" },
      model: createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })("claude-sonnet-4-5"),
    };
  }
  if (process.env.VERCEL === "1" || process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) {
    return { runtime: { provider: "vercel-gateway", model: String(GATEWAY_MODEL) }, model: GATEWAY_MODEL };
  }
  throw new Error("No live model. Deploy on Vercel with GROQ_API_KEY.");
}

async function generateExtract(model: LanguageModel, prompt: string, quote: string): Promise<ExtractObject> {
  try {
    const { output } = await generateText({
      model,
      output: Output.object({ schema: ExtractObjectSchema }),
      system: EXTRACT_PROMPT,
      prompt,
    });
    if (output) return applyPolicy(output, quote);
  } catch (e) {
    if (NoObjectGeneratedError.isInstance(e) && e.text) {
      try {
        return parseExtractJson(e.text, quote);
      } catch {
        /* fall through to a JSON-only retry */
      }
    }
  }

  const { text } = await generateText({
    model,
    system: EXTRACT_PROMPT,
    prompt: `${prompt}\n\nReturn JSON only. No markdown.`,
  });
  return parseExtractJson(text, quote);
}

export async function llmExtract(text: string): Promise<{ extract: ExtractObject; runtime: LlmRuntime; ms: number }> {
  const { runtime, model } = await resolveModel();
  const t0 = Date.now();
  const extract = await generateExtract(
    model,
    `Extract one JSON object for this public fashion quote. Do not invent a coupon. Quote:\n\n${text.slice(0, 2000)}`,
    text,
  );
  return { extract, runtime, ms: Date.now() - t0 };
}
