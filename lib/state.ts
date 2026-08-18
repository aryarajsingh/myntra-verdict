"use client";

import type { Bucket, Profile } from "@/data/types";
import { PRODUCTS } from "@/data/products";

const KEY = "verdict-state-v2";

export const DEMO_PROFILE: Profile = {
  top: "M",
  bottom: "M",
  ethnic: "L",
  height: "5'2\" – 5'5\"",
  fitPref: "Regular",
};

export type ItemOverride = {
  bucket?: Bucket;
  disagreed?: boolean;
  inBag?: string;
  removed?: boolean;
};

export type AppState = {
  profile: Profile | null;
  skipped: boolean;
  bag: { id: string; size: string }[];
  overrides: Record<string, ItemOverride>;
};

export const DEFAULT_STATE: AppState = {
  profile: DEMO_PROFILE,
  skipped: false,
  bag: [],
  overrides: {},
};

const DEFAULT = DEFAULT_STATE;

function read(): AppState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as AppState;
    return {
      ...DEFAULT,
      ...parsed,
      profile: parsed.profile ?? DEMO_PROFILE,
    };
  } catch {
    return DEFAULT;
  }
}

export function loadState(): AppState {
  return read();
}

export function saveState(next: AppState) {
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function effectiveBucket(id: string, state: AppState): Bucket {
  const p = PRODUCTS.find((x) => x.id === id)!;
  const o = state.overrides[id];
  if (o?.removed) return "exploring";
  if (o?.bucket) return o.bucket;
  if (p.saveReason === "Just saving") return "exploring";
  if (!state.profile) return p.defaultBucket;
  if (p.returnClass === "seal_tag" && p.defaultBucket === "exploring") return "exploring";
  if (p.oosSizes.includes(p.suggestedSize)) return "exploring";
  return p.defaultBucket;
}

export function track(event: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  const row = { event, props: props ?? {}, t: Date.now() };
  const prev = JSON.parse(sessionStorage.getItem("verdict-events") || "[]");
  prev.push(row);
  sessionStorage.setItem("verdict-events", JSON.stringify(prev.slice(-200)));
  console.info("[verdict]", event, props ?? {});
}
