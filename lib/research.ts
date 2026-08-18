import { INTERVIEWS } from "@/data/interviews";
import { SURVEY_STATS } from "@/data/survey";
import type { BarrierId } from "@/data/types";

export const SURVEY_N = SURVEY_STATS.inTarget;
export const INTERVIEW_N = INTERVIEWS.length;

const SHORT: Record<BarrierId, string> = {
  fit_uncertainty: "Fit",
  return_seal_tag_fear: "Return / seal-tag",
  size_chart_distrust: "Size chart",
  comparison_paralysis: "Compare",
  quality_doubt: "Quality",
  styling_occasion: "Occasion",
  budget_sale_wait: "Sale wait",
  wishlist_clutter: "Clutter",
  bookmark_only: "Bookmark",
};

const SURVEY_Q3: Partial<Record<BarrierId, number>> = {
  fit_uncertainty: SURVEY_STATS.q3Fit,
  return_seal_tag_fear: SURVEY_STATS.q3Return,
  size_chart_distrust: SURVEY_STATS.q3Chart,
  comparison_paralysis: SURVEY_STATS.q3Compare,
  budget_sale_wait: SURVEY_STATS.q3Sale,
  bookmark_only: SURVEY_STATS.q3Bookmark,
  styling_occasion: SURVEY_STATS.q3Occasion,
  quality_doubt: SURVEY_STATS.q3Quality,
  wishlist_clutter: SURVEY_STATS.q3Clutter,
};

export type FreezeRow = {
  id: BarrierId;
  label: string;
  interviews: number;
  survey: number;
  interviewsPct: number;
  surveyPct: number;
  disq: boolean;
};

function largestRemainder(counts: number[], total: number): number[] {
  if (total <= 0) return counts.map(() => 0);
  const raw = counts.map((c) => (100 * c) / total);
  const floors = raw.map((x) => Math.floor(x));
  let rem = 100 - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((x, i) => ({ i, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac);
  const out = [...floors];
  for (let k = 0; k < rem; k++) out[order[k % order.length].i] += 1;
  return out;
}

export function freezeRows(): FreezeRow[] {
  const rows = (Object.keys(SHORT) as BarrierId[])
    .map((id) => {
      const interviews = INTERVIEWS.filter((i) => i.barrier === id).length;
      const survey = SURVEY_Q3[id] ?? 0;
      return {
        id,
        label: SHORT[id],
        interviews,
        survey,
        interviewsPct: 0,
        surveyPct: 0,
        disq: id === "budget_sale_wait",
      };
    })
    .filter((r) => r.interviews + r.survey > 0)
    .sort((a, b) => b.survey + b.interviews * 6 - (a.survey + a.interviews * 6));
  const surveyTotal = rows.reduce((s, r) => s + r.survey, 0) || SURVEY_N;
  const interviewTotal = rows.reduce((s, r) => s + r.interviews, 0) || INTERVIEW_N;
  const surveyPcts = largestRemainder(
    rows.map((r) => r.survey),
    surveyTotal,
  );
  const interviewPcts = largestRemainder(
    rows.map((r) => r.interviews),
    interviewTotal,
  );
  return rows.map((r, i) => ({ ...r, surveyPct: surveyPcts[i], interviewsPct: interviewPcts[i] }));
}

export type LeverRow = {
  id: string;
  short: string;
  label: string;
  n: number;
  of: number;
  pct: number;
  disq?: boolean;
};

export function leverRows(): LeverRow[] {
  const of = SURVEY_N;
  const rows = [
    {
      id: "q5",
      short: "Fit analog + policy",
      label: "Would buy this week if fit analog + policy in words (Q5)",
      n: SURVEY_STATS.q5Legal,
      of,
    },
    { id: "q2", short: "Still intend to buy", label: "Still intend to buy the saved item (Q2)", n: SURVEY_STATS.q2Yes, of },
    {
      id: "q10",
      short: "PDP story gone",
      label: "PDP size story gone when they reopen wishlist (Q10)",
      n: SURVEY_STATS.q10Yes,
      of,
    },
    { id: "q12", short: "Mostly moodboard", label: "Mostly a moodboard, not a shopping list (Q12)", n: SURVEY_STATS.q12Moodboard, of },
    {
      id: "q5c",
      short: "Coupon only",
      label: "Would buy only if there’s a coupon (Q5)",
      n: SURVEY_STATS.q5CouponOnly,
      of,
      disq: true,
    },
  ];
  return rows.map((r) => ({ ...r, pct: Math.round((100 * r.n) / r.of) }));
}

export type OffAppRow = { id: string; label: string; n: number; people: string[] };

export function offAppRows(): OffAppRow[] {
  const buckets: { id: string; label: string; test: RegExp }[] = [
    { id: "people", label: "WhatsApp / friends / family", test: /whatsapp|sister|husband|colleague|friend|group chat|family/ },
    { id: "youtube", label: "YouTube hauls", test: /youtube/ },
    { id: "instagram", label: "Instagram", test: /instagram/ },
    { id: "google", label: "Google / Reddit / tape", test: /google|reddit|tape/ },
    { id: "store", label: "Physical store", test: /boutique|linking road|brand store/ },
  ];
  return buckets
    .map((b) => {
      const people = INTERVIEWS.filter((i) => b.test.test(`${i.outsideApp} ${i.overcome}`.toLowerCase())).map(
        (i) => i.id,
      );
      return { id: b.id, label: b.label, n: people.length, people };
    })
    .filter((r) => r.n > 0)
    .sort((a, b) => b.n - a.n);
}

export function peopleForBarrier(id: BarrierId) {
  return INTERVIEWS.filter((i) => i.barrier === id).map((i) => i.id);
}

export function namesForIds(ids: string[]) {
  return ids
    .map((id) => INTERVIEWS.find((i) => i.id === id)?.name.split(" ")[0])
    .filter((n): n is string => Boolean(n))
    .join(", ");
}
