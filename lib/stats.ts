import { CORPUS, quotesFor } from "@/data/corpus";
import { OPPORTUNITIES } from "@/data/opportunities";
import type { BarrierId, Quote } from "@/data/types";

const OFF_APP = ["whatsapp_friends", "youtube_haul", "instagram", "size_chart_google", "store_tryon"] as const;

export type MixRow = { key: string; n: number; pct: number };

export const WHY_SAVED_LABEL: Record<Quote["whySaved"], string> = {
  intent: "Genuine buy-later",
  bookmark: "Bookmark / moodboard",
  sale_wait: "Wait for a sale",
  occasion: "Occasion / event-tied",
  compare_later: "Shortlist to compare",
};

export const WORKAROUND_LABEL: Record<Quote["workaround"], string> = {
  whatsapp_friends: "WhatsApp / friends (social)",
  youtube_haul: "YouTube hauls",
  order_two_sizes: "Order two sizes",
  wait_eors: "Wait for EORS",
  size_chart_google: "Google size charts / reviews",
  abandon: "Abandon / freeze in-list",
  instagram: "Instagram",
  store_tryon: "Store try-on",
  none: "No off-app workaround coded",
};

export const BRIEF_SOURCES = [
  { brief: "App Store reviews", keys: ["App Store"] },
  { brief: "Play Store reviews", keys: ["Play Store"] },
  { brief: "Reddit discussions", keys: ["Reddit"] },
  { brief: "Fashion and shopping communities", keys: ["Fashion community"] },
  { brief: "Social media conversations", keys: ["Threads", "Instagram"] },
  { brief: "YouTube comments", keys: ["YouTube comments"] },
  { brief: "Product reviews and Q&A", keys: ["Trustpilot", "Product Q&A"] },
  { brief: "Other public conversations", keys: ["Consumer complaints"] },
] as const;

export function mixOfSlice(quotes: Quote[], get: (q: Quote) => string): MixRow[] {
  const n = quotes.length || 1;
  const m = new Map<string, number>();
  for (const c of quotes) {
    const k = get(c);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([key, count]) => ({
      key,
      n: count,
      pct: Math.round((count / n) * 100) || (count > 0 ? 1 : 0),
    }))
    .sort((a, b) => b.n - a.n);
}

export function mixOf(get: (q: Quote) => string): MixRow[] {
  return mixOfSlice(CORPUS, get);
}

export function corpusStats() {
  const n = CORPUS.length;
  const genuine = CORPUS.filter((c) => c.intent === "genuine").length;
  const bookmark = CORPUS.filter((c) => c.intent === "bookmark").length;
  const mixed = CORPUS.filter((c) => c.intent === "mixed").length;
  const off = CORPUS.filter((c) => (OFF_APP as readonly string[]).includes(c.workaround)).length;
  const social = CORPUS.filter((c) => c.workaround === "whatsapp_friends" || c.workaround === "instagram").length;
  const fit = quotesFor("fit_uncertainty").length;
  const ret = quotesFor("return_seal_tag_fear").length;
  const sale = quotesFor("budget_sale_wait").length;
  return {
    n,
    genuinePct: Math.round((genuine / n) * 100),
    bookmarkIntentPct: Math.round((bookmark / n) * 100),
    mixedPct: Math.round((mixed / n) * 100),
    offPct: Math.round((off / n) * 100),
    socialPct: Math.round((social / n) * 100),
    fitPct: Math.round((fit / n) * 100),
    returnPct: Math.round((ret / n) * 100),
    salePct: Math.round((sale / n) * 100),
    bookmarkPct: Math.round((quotesFor("bookmark_only").length / n) * 100),
    comparePct: Math.round((quotesFor("comparison_paralysis").length / n) * 100),
    occasionPct: Math.round((quotesFor("styling_occasion").length / n) * 100),
    qualityPct: Math.round((quotesFor("quality_doubt").length / n) * 100),
    sizeChartPct: Math.round((quotesFor("size_chart_distrust").length / n) * 100),
  };
}

export function shareOf(id: BarrierId) {
  return Math.round((quotesFor(id).length / CORPUS.length) * 100);
}

export function quoteById(id: string) {
  return CORPUS.find((c) => c.id === id);
}

export function segmentBucket(s: string): string {
  if (/18\s*[–-]\s*24/.test(s)) return "Women 18–24";
  if (/22\s*[–-]\s*28/.test(s)) return "Women 22–28";
  if (/Man\//.test(s) || /^Man/.test(s)) return "Mixed / men";
  if (/24\s*[–-]\s*35/.test(s)) return "Women 24–35";
  if (/28\s*[–-]\s*35|24\s*[–-]\s*40|25\s*[–-]\s*40/.test(s)) return "Women 28–40";
  return "Women 24–32 metro";
}

export function barrierBySegment() {
  const groups = new Map<string, Quote[]>();
  for (const c of CORPUS) {
    const b = segmentBucket(c.segment);
    const arr = groups.get(b) ?? [];
    arr.push(c);
    groups.set(b, arr);
  }
  return [...groups.entries()]
    .map(([segment, quotes]) => {
      const barriers = new Map<BarrierId, number>();
      for (const q of quotes) barriers.set(q.barrier, (barriers.get(q.barrier) ?? 0) + 1);
      const top = [...barriers.entries()].sort((a, b) => b[1] - a[1])[0];
      const genuine = quotes.filter((q) => q.intent === "genuine").length;
      const off = quotes.filter((q) => (OFF_APP as readonly string[]).includes(q.workaround)).length;
      return {
        segment,
        n: quotes.length,
        pct: Math.round((quotes.length / CORPUS.length) * 100),
        topBarrier: top ? OPPORTUNITIES.find((o) => o.id === top[0])?.name ?? top[0] : "—",
        topShare: top ? Math.round((top[1] / quotes.length) * 100) : 0,
        genuinePct: Math.round((genuine / quotes.length) * 100),
        offPct: Math.round((off / quotes.length) * 100),
      };
    })
    .sort((a, b) => b.n - a.n);
}

export function sourceCoverage() {
  return BRIEF_SOURCES.map((row) => {
    const n = CORPUS.filter((c) => (row.keys as readonly string[]).includes(c.source)).length;
    return { brief: row.brief, sources: row.keys.join(" + "), n, pct: Math.round((n / CORPUS.length) * 100) };
  });
}

export function roleRows() {
  const s = corpusStats();
  return [
    {
      role: "Fit",
      coded: "Primary barrier = fit uncertainty",
      share: `${s.fitPct}% of corpus`,
      play: "Blocks bagging an already saved SKU. Picked.",
    },
    {
      role: "Size",
      coded: "Size-chart distrust + fit analog gap",
      share: `${s.sizeChartPct}% chart distrust; feeds fit`,
      play: "Charts are theatre. Users want kept/returned for their band, not cms.",
    },
    {
      role: "Styling",
      coded: "Styling / occasion barrier",
      share: `${s.occasionPct}% of corpus`,
      play: "Maya already lives on discovery. Weak post-save lever vs fit.",
    },
    {
      role: "Price",
      coded: "Budget / EORS wait",
      share: `${s.salePct}% of corpus`,
      play: "Frequent. Ranked. DISQUALIFIED — I cannot pay for conversion.",
    },
    {
      role: "Reviews",
      coded: "Users leave to re-read PDP / hauls because wishlist has no analog",
      share: `${s.offPct}% leave the app`,
      play: "Need a kept-vs-returned story on the saved card, not more stars.",
    },
    {
      role: "Occasion",
      coded: "whySaved = occasion, or styling_occasion barrier",
      share: `${mixOf((c) => c.whySaved).find((r) => r.key === "occasion")?.pct ?? 0}% of saves coded occasion`,
      play: "Often exceeds 30 days by design. Do not nag. Still exploring.",
    },
    {
      role: "Social validation",
      coded: "workaround = WhatsApp or Instagram",
      share: `${s.socialPct}% of corpus`,
      play: "Friends cannot answer brand-cut fit. Verdict must replace the screenshot loop.",
    },
  ];
}

export const PICK = OPPORTUNITIES[0];
export const CO_PRIMARY = OPPORTUNITIES[1];
export const DISQUALIFIED = OPPORTUNITIES.find((o) => o.disqualifiedMonetary)!;
