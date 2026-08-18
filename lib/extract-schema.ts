import { z } from "zod";
import type { BarrierId } from "@/data/types";
import type { Classification } from "@/lib/classify";

export const BARRIERS = [
  "fit_uncertainty",
  "return_seal_tag_fear",
  "size_chart_distrust",
  "comparison_paralysis",
  "quality_doubt",
  "styling_occasion",
  "budget_sale_wait",
  "wishlist_clutter",
  "bookmark_only",
] as const satisfies readonly BarrierId[];

const JOBS = ["intent", "bookmark", "sale_wait", "occasion", "compare_later"] as const;
const INTENTS = ["genuine", "bookmark", "mixed"] as const;
const WORKAROUNDS = [
  "whatsapp_friends",
  "youtube_haul",
  "instagram",
  "size_chart_google",
  "store_tryon",
  "order_two_sizes",
  "wait_eors",
  "abandon",
  "none",
] as const;

export const ExtractObjectSchema = z.object({
  job: z.enum(JOBS),
  barrier: z.enum(BARRIERS),
  intent: z.enum(INTENTS),
  workaround: z.enum(WORKAROUNDS),
  severity: z.number().int().min(1).max(5),
  metricProximity: z.number().int().min(1).max(5),
  productCall: z.string().min(8),
});

export type ExtractObject = z.infer<typeof ExtractObjectSchema>;

function clampScore(n: unknown): 1 | 2 | 3 | 4 | 5 {
  const v = Math.round(Number(n));
  if (!Number.isFinite(v)) return 3;
  return Math.max(1, Math.min(5, v)) as 1 | 2 | 3 | 4 | 5;
}

function pickEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const s = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if ((allowed as readonly string[]).includes(s)) return s as T;
  const hit = allowed.find((a) => s.includes(a) || a.includes(s));
  return hit ?? fallback;
}

export function applyPolicy(extract: ExtractObject, quote = ""): ExtractObject {
  let next = extract;
  const q = quote.toLowerCase();
  const bodyMapping = /on this brand|m i wear|will (it|this) fit|between sizes|on my body|body type/.test(q);
  if (next.barrier === "size_chart_distrust" && bodyMapping) {
    next = { ...next, barrier: "fit_uncertainty" };
  }
  if (next.workaround === "wait_eors") {
    next = { ...next, barrier: "budget_sale_wait" };
  }
  if (next.barrier !== "budget_sale_wait") return next;
  const call = next.productCall.startsWith("DISQUALIFY")
    ? next.productCall
    : `DISQUALIFY. ${next.productCall}`;
  return { ...next, productCall: call };
}

export function coerceExtract(raw: unknown, quote = ""): ExtractObject {
  const obj = typeof raw === "object" && raw ? (raw as Record<string, unknown>) : {};
  let productCall = String(obj.productCall ?? obj.product_call ?? "").trim();
  if (productCall.length < 8) productCall = `${productCall} — see barrier.`.slice(0, 200);
  return applyPolicy(
    {
      job: pickEnum(obj.job, JOBS, "intent"),
      barrier: pickEnum(obj.barrier, BARRIERS, "fit_uncertainty"),
      intent: pickEnum(obj.intent, INTENTS, "genuine"),
      workaround: pickEnum(obj.workaround, WORKAROUNDS, "none"),
      severity: clampScore(obj.severity),
      metricProximity: clampScore(obj.metricProximity ?? obj.metric_proximity),
      productCall,
    },
    quote,
  );
}

export function parseExtractJson(text: string, quote = ""): ExtractObject {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Model returned no JSON object.");
  return coerceExtract(JSON.parse(text.slice(start, end + 1)), quote);
}

export function extractToClassification(
  text: string,
  extract: ExtractObject,
  lexical: Classification,
  runtime: { provider: string; model: string },
): Classification {
  const barrier = extract.barrier;
  const oppName = lexical.breakdown.find((b) => b.id === barrier)?.name ?? barrier;
  const disqualifiedMonetary = barrier === "budget_sale_wait";
  const top = lexical.breakdown.find((b) => b.id === barrier);
  return {
    ...lexical,
    barrier,
    opportunityName: oppName,
    confidence: "high",
    hits: top?.hits?.length ? top.hits : [runtime.model],
    disqualifiedMonetary,
    productCall: extract.productCall,
    job: extract.job,
    workaround: extract.workaround,
    intentGuess: extract.intent,
    severity: extract.severity as 1 | 2 | 3 | 4 | 5,
    metricProximity: extract.metricProximity as 1 | 2 | 3 | 4 | 5,
    extract: {
      job: extract.job,
      barrier,
      intent: extract.intent,
      workaround: extract.workaround,
      severity: extract.severity as 1 | 2 | 3 | 4 | 5,
      metricProximity: extract.metricProximity as 1 | 2 | 3 | 4 | 5,
      productCall: extract.productCall,
    },
    why: lexical.why,
  };
}
