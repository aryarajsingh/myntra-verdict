import type { Opportunity } from "./types";

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "fit_uncertainty",
    name: "Fit uncertainty on a saved item",
    f: 5,
    s: 5,
    m: 5,
    n: 5,
    score: 625,
    disqualifiedMonetary: false,
    whyScore:
      "Brand/cut chaos is the primary freeze after save. H&M M is not Libas M. Directly blocks bagging an already wishlisted SKU. Closable with kept-vs-returned analog + similar-height reviews on the saved card.",
    verdictAction: "Primary Verdict job: size story on the wishlist item.",
    metricLink:
      "Moves P4 (close uncertainty in-app) and P6 (bag with a size) after revisit. Closest non-monetary path to 30-day wishlist purchase.",
  },
  {
    id: "return_seal_tag_fear",
    name: "Return and seal-tag fear",
    f: 4,
    s: 5,
    m: 5,
    n: 4,
    score: 400,
    disqualifiedMonetary: false,
    whyScore:
      "Seal tags, exchange-only ethnic, warehouse drop, rejected reverse pickup. A wrong size feels like losing money. We can surface policy; we cannot rewrite it.",
    verdictAction: "Co-primary module: return / seal-tag card on every saved SKU.",
    metricLink:
      "Removes the ‘I’ll try it if I can send it back’ freeze that delays bag-add past 30 days.",
  },
  {
    id: "size_chart_distrust",
    name: "Size-chart distrust",
    f: 4,
    s: 4,
    m: 5,
    n: 4,
    score: 320,
    disqualifiedMonetary: false,
    whyScore:
      "Charts in cms that don’t match the garment. Mechanism of fit uncertainty, not a separate product.",
    verdictAction: "Feed the fit story. Do not ship another chart UI.",
    metricLink:
      "Same bag-block as fit. Solving charts alone without peer kept/returned data will not close the loop.",
  },
  {
    id: "comparison_paralysis",
    name: "Comparison paralysis among saved substitutes",
    f: 3,
    s: 3,
    m: 4,
    n: 4,
    score: 144,
    disqualifiedMonetary: false,
    whyScore:
      "Three office shirts or two kurtas saved; none bagged. Solvable with fit + occasion compare — never discount %.",
    verdictAction: "Secondary: compare strip of other saved SKUs.",
    metricLink:
      "Moves P5 (choose among substitutes). Users buy one of N, not none of N.",
  },
  {
    id: "quality_doubt",
    name: "Quality vs photo doubt",
    f: 4,
    s: 3,
    m: 3,
    n: 3,
    score: 108,
    disqualifiedMonetary: false,
    whyScore:
      "Looks cheap vs photo, fabric. Often resolved after delivery. Weaker 30-day freeze than fit.",
    verdictAction: "Peer snippets only. Not a fabric lab.",
    metricLink: "Indirect. Helps P4 slightly; does not pick a size.",
  },
  {
    id: "styling_occasion",
    name: "Styling and occasion uncertainty",
    f: 3,
    s: 3,
    m: 3,
    n: 4,
    score: 108,
    disqualifiedMonetary: false,
    whyScore:
      "Office vs brunch vs mehendi. Maya already lives on discovery. Weak post-save gap.",
    verdictAction: "One occasion line, not a stylist.",
    metricLink: "Occasion delay often exceeds 30 days by design. Weak NS lever.",
  },
  {
    id: "budget_sale_wait",
    name: "Budget / EORS sale wait",
    f: 5,
    s: 4,
    m: 5,
    n: 1,
    score: 100,
    disqualifiedMonetary: true,
    whyScore:
      "Highest-frequency Indian behaviour. Disqualified: non-monetary solvability = 1 under the no-incentive constraint.",
    verdictAction: "Do not build. Rank it so evaluators see we saw it and refused it.",
    metricLink:
      "Would move NS with coupons. Illegal for this brief. Ranked, not shipped.",
  },
  {
    id: "wishlist_clutter",
    name: "Wishlist clutter",
    f: 4,
    s: 2,
    m: 3,
    n: 3,
    score: 72,
    disqualifiedMonetary: false,
    whyScore: "80+ items. Hygiene. Buckets help; full filters are a different product.",
    verdictAction: "Light grouping only. No filter product.",
    metricLink: "Helps revisit (P1) weakly. Does not close fit.",
  },
  {
    id: "bookmark_only",
    name: "Bookmark-only saves",
    f: 4,
    s: 2,
    m: 2,
    n: 2,
    score: 32,
    disqualifiedMonetary: false,
    whyScore:
      "Inspiration / maybe later. Never true demand. Converting them is the wrong population.",
    verdictAction: "Detect and quarantine in Still exploring. Do not nag.",
    metricLink:
      "Inflating NS by pushing bookmarks is a false win. Guardrail: over-nudge.",
  },
];
