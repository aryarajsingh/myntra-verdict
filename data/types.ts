export type BarrierId =
  | "fit_uncertainty"
  | "return_seal_tag_fear"
  | "size_chart_distrust"
  | "comparison_paralysis"
  | "quality_doubt"
  | "styling_occasion"
  | "budget_sale_wait"
  | "wishlist_clutter"
  | "bookmark_only";

export type WhySaved =
  | "intent"
  | "bookmark"
  | "sale_wait"
  | "occasion"
  | "compare_later";

export type Workaround =
  | "whatsapp_friends"
  | "youtube_haul"
  | "order_two_sizes"
  | "wait_eors"
  | "size_chart_google"
  | "abandon"
  | "instagram"
  | "store_tryon"
  | "none";

export type Quote = {
  id: string;
  source: string;
  sourceUrl: string;
  date: string;
  text: string;
  barrier: BarrierId;
  whySaved: WhySaved;
  workaround: Workaround;
  segment: string;
  intent: "genuine" | "bookmark" | "mixed";
  metricProximity: 1 | 2 | 3 | 4 | 5;
  severity: 1 | 2 | 3 | 4 | 5;
};

export type Opportunity = {
  id: BarrierId;
  name: string;
  f: number;
  s: number;
  m: number;
  n: number;
  score: number;
  disqualifiedMonetary: boolean;
  whyScore: string;
  verdictAction: string;
  metricLink: string;
};

export type ReturnClass = "easy_return" | "exchange_only" | "seal_tag";

export type Bucket = "ready" | "check_fit" | "exploring";

export type Product = {
  id: string;
  brand: string;
  name: string;
  price: number;
  mrp: number;
  category: "tops" | "bottoms" | "ethnic" | "dress" | "saree";
  occasion: string;
  saveReason: "Workwear" | "Wedding guest" | "Just saving" | "Ethnic everyday";
  defaultBucket: Bucket;
  suggestedSize: string;
  altSize: string;
  returnClass: ReturnClass;
  fitConfidence: number;
  kept: number;
  exchanged: number;
  returned: number;
  image: string;
  imageBg: string;
  fitLine: string;
  verdictHeadline: string;
  fitBullets: string[];
  garmentNote: string;
  reviews: {
    size: string;
    height: string;
    fitPref: string;
    quote: string;
    outcome: "Kept" | "Exchanged to L" | "Returned — fabric" | "Exchanged to M";
  }[];
  occasionLine: string;
  substitutes: string[];
  oosSizes: string[];
  faqs: Record<string, string>;
};

export type Profile = {
  top: string;
  bottom: string;
  ethnic: string;
  height: string;
  fitPref: "Fitted" | "Regular" | "Relaxed";
};

export type Interview = {
  id: string;
  name: string;
  age: number;
  city: string;
  job: string;
  myntraUse: string;
  wishlistCount: string;
  whySaved: string;
  stillIntend: string;
  stopping: string;
  wouldPurchase: string;
  infoNeeded: string;
  alternatives: string;
  outsideApp: string;
  overcome: string;
  quotes: string[];
  barrier: BarrierId;
};
