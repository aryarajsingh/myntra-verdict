import { CORPUS } from "@/data/corpus";
import { OPPORTUNITIES } from "@/data/opportunities";
import { quotesFor } from "@/data/corpus";
import type { BarrierId } from "@/data/types";

const OFF_APP = ["whatsapp_friends", "youtube_haul", "instagram", "size_chart_google", "store_tryon"] as const;

export function corpusStats() {
  const n = CORPUS.length;
  const genuine = CORPUS.filter((c) => c.intent === "genuine").length;
  const off = CORPUS.filter((c) => (OFF_APP as readonly string[]).includes(c.workaround)).length;
  const fit = quotesFor("fit_uncertainty").length;
  const ret = quotesFor("return_seal_tag_fear").length;
  const sale = quotesFor("budget_sale_wait").length;
  return {
    n,
    genuinePct: Math.round((genuine / n) * 100),
    offPct: Math.round((off / n) * 100),
    fitPct: Math.round((fit / n) * 100),
    returnPct: Math.round((ret / n) * 100),
    salePct: Math.round((sale / n) * 100),
    bookmarkPct: Math.round((quotesFor("bookmark_only").length / n) * 100),
  };
}

export function shareOf(id: BarrierId) {
  return Math.round((quotesFor(id).length / CORPUS.length) * 100);
}

export const PICK = OPPORTUNITIES[0];
export const CO_PRIMARY = OPPORTUNITIES[1];
export const DISQUALIFIED = OPPORTUNITIES.find((o) => o.disqualifiedMonetary)!;
