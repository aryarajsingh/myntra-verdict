import type { BarrierId } from "@/data/types";
import { OPPORTUNITIES } from "@/data/opportunities";

const KEYS: Record<BarrierId, string[]> = {
  fit_uncertainty: [
    "fit",
    "fitting",
    "tight",
    "loose",
    "size up",
    "size down",
    "runs small",
    "runs large",
    "won't fit",
    "will it fit",
    "body type",
    "hips",
    "bust",
    "shoulder",
    "length",
    "drape",
    "on me",
  ],
  return_seal_tag_fear: [
    "return",
    "exchange",
    "seal tag",
    "seal",
    "refund",
    "pickup",
    "rejected",
    "warehouse",
    "non-returnable",
    "try and buy",
    "reverse",
  ],
  size_chart_distrust: [
    "size chart",
    "sizechart",
    "cms",
    "inches",
    "measurement",
    "chart is wrong",
    "chart is a lie",
    "guidelines",
  ],
  comparison_paralysis: [
    "compare",
    "similar",
    "which one",
    "shortlist",
    "can't decide",
    "too many",
    "options",
    "between these",
  ],
  quality_doubt: [
    "quality",
    "cheap",
    "fabric",
    "see through",
    "photo",
    "looks different",
    "material",
    "stich",
    "stitch",
  ],
  styling_occasion: [
    "occasion",
    "office",
    "wedding",
    "mehendi",
    "style",
    "wear with",
    "outfit",
    "function",
    "sangeet",
  ],
  budget_sale_wait: [
    "sale",
    "eors",
    "discount",
    "price drop",
    "wait for",
    "too expensive",
    "coupon",
    "cashback",
    "end of reason",
  ],
  wishlist_clutter: [
    "wishlist is full",
    "hundreds",
    "clutter",
    "can't find",
    "scroll",
    "too many saved",
    "old items",
  ],
  bookmark_only: [
    "bookmark",
    "later",
    "inspiration",
    "just saving",
    "maybe someday",
    "moodboard",
    "not buying",
  ],
};

export function classifyText(text: string): {
  barrier: BarrierId;
  opportunityName: string;
  confidence: "high" | "medium" | "low";
  hits: string[];
  why: string;
  metricLink: string;
  disqualifiedMonetary: boolean;
} {
  const lower = text.toLowerCase();
  const scores: { id: BarrierId; n: number; hits: string[] }[] = [];

  (Object.keys(KEYS) as BarrierId[]).forEach((id) => {
    const hits = KEYS[id].filter((k) => lower.includes(k));
    scores.push({ id, n: hits.length, hits });
  });

  scores.sort((a, b) => b.n - a.n);
  const top = scores[0];
  const second = scores[1];
  const barrier: BarrierId = top.n === 0 ? "fit_uncertainty" : top.id;
  const opp = OPPORTUNITIES.find((o) => o.id === barrier)!;
  const confidence =
    top.n === 0 ? "low" : top.n >= 3 || (second && top.n - second.n >= 2) ? "high" : "medium";

  return {
    barrier,
    opportunityName: opp.name,
    confidence,
    hits: top.hits.slice(0, 6),
    why: opp.whyScore,
    metricLink: opp.metricLink,
    disqualifiedMonetary: opp.disqualifiedMonetary,
  };
}
