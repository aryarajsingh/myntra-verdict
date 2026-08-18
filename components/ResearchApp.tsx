"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ResearchCharts } from "@/components/ResearchCharts";
import { INTERVIEWS } from "@/data/interviews";
import { LINKS } from "@/lib/links";
import { offAppRows, peopleForBarrier, SURVEY_N } from "@/lib/research";
import { OPPORTUNITIES } from "@/data/opportunities";
import { SURVEY_STATS } from "@/data/survey";
import type { BarrierId } from "@/data/types";

const BRIEF_Q = [
  { key: "whySaved" as const, label: "Why they saved each item" },
  { key: "stillIntend" as const, label: "Whether they still intend to purchase it" },
  { key: "stopping" as const, label: "What is stopping them" },
  { key: "wouldPurchase" as const, label: "What would make them purchase it" },
  { key: "infoNeeded" as const, label: "What information they still need" },
  { key: "alternatives" as const, label: "Whether they are considering alternatives" },
  { key: "outsideApp" as const, label: "What happens outside the app before they decide" },
  { key: "overcome" as const, label: "How they currently overcome uncertainty" },
];

export function ResearchApp() {
  const [who, setWho] = useState(INTERVIEWS[0].id);
  const [barrier, setBarrier] = useState<BarrierId | null>(null);
  const [offFilter, setOffFilter] = useState<string | null>(null);
  const current = INTERVIEWS.find((i) => i.id === who) ?? INTERVIEWS[0];

  const highlight = useMemo(() => {
    const fromBarrier = barrier ? peopleForBarrier(barrier) : null;
    const fromOff = offFilter ? (offAppRows().find((r) => r.id === offFilter)?.people ?? null) : null;
    const a = fromBarrier && fromBarrier.length ? fromBarrier : null;
    const b = fromOff && fromOff.length ? fromOff : null;
    if (a && b) return a.filter((id) => b.includes(id));
    return a ?? b;
  }, [barrier, offFilter]);

  function pickPerson(id: string) {
    setWho(id);
    document.getElementById("interview-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function onBarrier(id: BarrierId | null) {
    setBarrier(id);
    if (!id) return;
    const first = peopleForBarrier(id)[0];
    if (first) pickPerson(first);
  }

  return (
    <div className="hub research">
      <p className="hub-kicker">Research</p>
      <h1 className="display sm">Six interviews. Survey on the same freeze.</h1>
      <p className="hub-lede">
        Metro working women, 24–32. Same eight brief prompts in each write-up. Survey is {SURVEY_STATS.n} rows,{" "}
        {SURVEY_N} in-target — a count, not a replacement for the rooms.
      </p>

      <div className="person-nav" role="tablist" aria-label="Respondents">
        {INTERVIEWS.map((i) => (
          <button
            key={i.id}
            type="button"
            role="tab"
            aria-selected={who === i.id}
            className={`person-chip ${who === i.id ? "on" : ""} ${highlight && !highlight.includes(i.id) ? "dim" : ""}`}
            onClick={() => pickPerson(i.id)}
          >
            {i.name.split(" ")[0]}
            <span>
              {i.city} · {OPPORTUNITIES.find((o) => o.id === i.barrier)?.name.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      <article id="interview-card" className="interview-hero">
        <header>
          <h2>
            {current.name} · {current.age} · {current.city}
          </h2>
          <p className="muted">
            {current.job} · {current.myntraUse} · {current.wishlistCount}
          </p>
          <p className="freeze">Freeze: {OPPORTUNITIES.find((o) => o.id === current.barrier)?.name}</p>
        </header>
        {BRIEF_Q.map((q) => (
          <p key={q.key}>
            <b>{q.label}.</b> {current[q.key]}
          </p>
        ))}
        {current.quotes.map((q) => (
          <blockquote key={q} className="quote">
            {q}
          </blockquote>
        ))}
      </article>

      <p className="survey-link-row">
        <Link href="/survey/">Survey</Link>
        {" — "}
        questions and workbook ({SURVEY_STATS.n} rows). Charts below use the in-target cut.
      </p>

      <ResearchCharts barrier={barrier} onBarrier={onBarrier} offFilter={offFilter} onOffFilter={setOffFilter} />

      <h2 className="hub-sec">What I take from this</h2>
      <div className="research-take">
        <p>
          The freeze is at wishlist revisit, not at discovery. Ananya: the size story was on the PDP and is gone on the
          saved card. Survey: {SURVEY_STATS.q10Yes} of {SURVEY_N} say the same.
        </p>
        <p>
          Fit is the plurality. 2 of 6 rooms, {SURVEY_STATS.q3Fit} of {SURVEY_N} survey. Return / seal-tag is next (Riya,
          Sneha; {SURVEY_STATS.q3Return} survey). Sale shows up ({SURVEY_STATS.q3Sale} survey). Priya uses sale as
          risk-offset, not greed. I still can’t ship a coupon, so it’s DISQUALIFIED.
        </p>
        <p>
          {SURVEY_STATS.q5Legal} of {SURVEY_N} would buy this week if they got a fit analog and the return policy in
          words. {SURVEY_STATS.q5CouponOnly} said coupon only. Kavya is the bookmark warning: ~10 of 96 items were ever
          intent — don’t bag-CTA a moodboard.
        </p>
        <p>
          They leave the app to decide (WhatsApp, hauls, a tape on a kept pair). If Verdict doesn’t sit on the saved
          item, the 30-day window is already gone.
        </p>
      </div>
    </div>
  );
}
