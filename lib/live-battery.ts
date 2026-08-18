import { SAMPLE_QUOTES } from "@/lib/classify";
import type { BarrierId } from "@/data/types";

export const LIVE_BATTERY: { label: string; text: string; gold: BarrierId }[] = [
  { ...SAMPLE_QUOTES[0], gold: "fit_uncertainty" },
  { ...SAMPLE_QUOTES[1], gold: "return_seal_tag_fear" },
  { ...SAMPLE_QUOTES[2], gold: "budget_sale_wait" },
  { ...SAMPLE_QUOTES[3], gold: "bookmark_only" },
  { ...SAMPLE_QUOTES[4], gold: "comparison_paralysis" },
  { ...SAMPLE_QUOTES[5], gold: "fit_uncertainty" },
  { ...SAMPLE_QUOTES[6], gold: "return_seal_tag_fear" },
];
