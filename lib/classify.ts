import type { BarrierId } from "@/data/types";
import { OPPORTUNITIES } from "@/data/opportunities";

type Rule = { phrase: string; w: number };

const RULES: Record<BarrierId, Rule[]> = {
  fit_uncertainty: [
    { phrase: "will it fit", w: 4 },
    { phrase: "won't fit", w: 4 },
    { phrase: "runs small", w: 4 },
    { phrase: "runs large", w: 3 },
    { phrase: "size up", w: 3 },
    { phrase: "size down", w: 3 },
    { phrase: "on me", w: 2 },
    { phrase: "body type", w: 3 },
    { phrase: "fitting", w: 2 },
    { phrase: "tight", w: 2 },
    { phrase: "loose", w: 2 },
    { phrase: "hips", w: 3 },
    { phrase: "bust", w: 2 },
    { phrase: "shoulder", w: 3 },
    { phrase: "length", w: 2 },
    { phrase: "drape", w: 2 },
    { phrase: "petite", w: 3 },
    { phrase: "between sizes", w: 4 },
    { phrase: "true to size", w: 2 },
  ],
  return_seal_tag_fear: [
    { phrase: "seal tag", w: 5 },
    { phrase: "non-returnable", w: 5 },
    { phrase: "exchange only", w: 5 },
    { phrase: "rejected", w: 3 },
    { phrase: "refund", w: 2 },
    { phrase: "reverse pickup", w: 4 },
    { phrase: "pickup", w: 2 },
    { phrase: "warehouse", w: 2 },
    { phrase: "try and buy", w: 3 },
    { phrase: "return", w: 2 },
    { phrase: "exchange", w: 2 },
  ],
  size_chart_distrust: [
    { phrase: "size chart", w: 5 },
    { phrase: "sizechart", w: 5 },
    { phrase: "chart is", w: 3 },
    { phrase: "cms", w: 3 },
    { phrase: "measurement", w: 2 },
    { phrase: "inches", w: 1 },
    { phrase: "guidelines", w: 2 },
  ],
  comparison_paralysis: [
    { phrase: "can't decide", w: 4 },
    { phrase: "which one", w: 4 },
    { phrase: "too many", w: 2 },
    { phrase: "shortlist", w: 3 },
    { phrase: "compare", w: 3 },
    { phrase: "similar", w: 2 },
    { phrase: "options", w: 1 },
    { phrase: "between these", w: 4 },
  ],
  quality_doubt: [
    { phrase: "see through", w: 4 },
    { phrase: "looks cheap", w: 4 },
    { phrase: "looks different", w: 3 },
    { phrase: "quality", w: 2 },
    { phrase: "fabric", w: 2 },
    { phrase: "material", w: 2 },
    { phrase: "photo", w: 1 },
    { phrase: "stitch", w: 2 },
  ],
  styling_occasion: [
    { phrase: "mehendi", w: 4 },
    { phrase: "sangeet", w: 4 },
    { phrase: "wedding", w: 3 },
    { phrase: "occasion", w: 3 },
    { phrase: "office", w: 2 },
    { phrase: "wear with", w: 3 },
    { phrase: "function", w: 2 },
    { phrase: "outfit", w: 1 },
    { phrase: "style", w: 1 },
  ],
  budget_sale_wait: [
    { phrase: "end of reason", w: 5 },
    { phrase: "price drop", w: 4 },
    { phrase: "eors", w: 5 },
    { phrase: "cashback", w: 4 },
    { phrase: "coupon", w: 4 },
    { phrase: "wait for", w: 3 },
    { phrase: "too expensive", w: 3 },
    { phrase: "discount", w: 3 },
    { phrase: "sale", w: 3 },
  ],
  wishlist_clutter: [
    { phrase: "wishlist is full", w: 5 },
    { phrase: "too many saved", w: 4 },
    { phrase: "can't find", w: 3 },
    { phrase: "hundreds", w: 3 },
    { phrase: "clutter", w: 4 },
    { phrase: "old items", w: 2 },
    { phrase: "scroll", w: 1 },
  ],
  bookmark_only: [
    { phrase: "just saving", w: 5 },
    { phrase: "not buying", w: 4 },
    { phrase: "maybe someday", w: 4 },
    { phrase: "moodboard", w: 5 },
    { phrase: "inspiration", w: 4 },
    { phrase: "bookmark", w: 4 },
    { phrase: "pinterest", w: 4 },
    { phrase: "later", w: 1 },
  ],
};

export type BarrierScore = {
  id: BarrierId;
  name: string;
  weight: number;
  hits: string[];
  opportunityScore: number;
  disqualifiedMonetary: boolean;
};

export type Classification = {
  barrier: BarrierId;
  opportunityName: string;
  confidence: "high" | "medium" | "low";
  hits: string[];
  why: string;
  metricLink: string;
  disqualifiedMonetary: boolean;
  secondary?: BarrierId;
  breakdown: BarrierScore[];
  intentGuess: "genuine" | "bookmark" | "mixed";
  productCall: string;
};

export function classifyText(text: string): Classification {
  const lower = text.toLowerCase();
  const breakdown: BarrierScore[] = (Object.keys(RULES) as BarrierId[]).map((id) => {
    const hits: string[] = [];
    let weight = 0;
    for (const rule of RULES[id]) {
      if (lower.includes(rule.phrase)) {
        hits.push(rule.phrase);
        weight += rule.w;
      }
    }
    const opp = OPPORTUNITIES.find((o) => o.id === id)!;
    return {
      id,
      name: opp.name,
      weight,
      hits,
      opportunityScore: opp.score,
      disqualifiedMonetary: opp.disqualifiedMonetary,
    };
  });

  breakdown.sort((a, b) => b.weight - a.weight || b.opportunityScore - a.opportunityScore);
  const top = breakdown[0];
  const second = breakdown[1];
  const barrier: BarrierId = top.weight === 0 ? "fit_uncertainty" : top.id;
  const opp = OPPORTUNITIES.find((o) => o.id === barrier)!;
  const confidence: Classification["confidence"] =
    top.weight === 0 ? "low" : top.weight >= 6 || top.weight - (second?.weight ?? 0) >= 3 ? "high" : "medium";

  const bookmarkW = breakdown.find((b) => b.id === "bookmark_only")?.weight ?? 0;
  const saleW = breakdown.find((b) => b.id === "budget_sale_wait")?.weight ?? 0;
  const intentGuess: Classification["intentGuess"] =
    bookmarkW >= 4 ? "bookmark" : saleW >= 4 && top.id === "budget_sale_wait" ? "mixed" : "genuine";

  const productCall = opp.disqualifiedMonetary
    ? "Rank it. Do not ship. Constraint forbids paying for conversion."
    : barrier === "bookmark_only"
      ? "Quarantine in Still exploring. Do not convert this population."
      : opp.verdictAction;

  return {
    barrier,
    opportunityName: opp.name,
    confidence,
    hits: top.hits.slice(0, 8),
    why: opp.whyScore,
    metricLink: opp.metricLink,
    disqualifiedMonetary: opp.disqualifiedMonetary,
    secondary: second && second.weight > 0 && second.id !== barrier ? second.id : undefined,
    breakdown,
    intentGuess,
    productCall,
  };
}

export const SAMPLE_QUOTES = [
  {
    label: "Fit freeze",
    text: "I keep saving kurtas then never order because I cannot tell if M on this brand is the M I wear in another brand. Size chart is theatre.",
  },
  {
    label: "Return fear",
    text: "Seal tag was missing on delivery and they rejected my return. I will not buy anything I might need to try on. Wishlist only.",
  },
  {
    label: "EORS wait",
    text: "I only buy from wishlist during EORS. Rest of the year I just add. Waiting for the sale on a work shirt I would wear Monday.",
  },
  {
    label: "Bookmark",
    text: "I use wishlist like Pinterest. I am not converting and I don't want to. Stop emailing me about it.",
  },
];
