"use client";

import Link from "next/link";
import { ThinkingEvo } from "@/components/ThinkingEvo";
import { Funnel, HBars } from "@/components/Viz";
import { FLOW } from "@/lib/flow";
import { LINKS } from "@/lib/links";
import { useTour } from "@/components/LayoutTour";
import { OPPORTUNITIES } from "@/data/opportunities";
import { corpusStats } from "@/lib/stats";

export function CaseHub() {
  const tour = useTour();
  const stats = corpusStats();

  return (
    <div className="hub">
      <p className="hub-kicker">NextLeap · Myntra Growth · not the Myntra app</p>
      <h1 className="display">Wishlist → buy in 30 days. I can’t use coupons.</h1>
      <p className="hub-lede">
        Metric: share of users who purchase at least one wishlisted item within 30 days of adding it. I scored public
        reviews, did six interviews plus a survey, and built a small wishlist MVP. Fit uncertainty is 625. Return /
        seal-tag is 400. Waiting for sale ranks high — I disqualified it.
      </p>

      <div className="path-ctas hub-start">
        <Link href="/discovery/" className="primary">
          Discovery
        </Link>
        <button className="secondary" type="button" onClick={tour.open}>
          What’s on this site
        </button>
        <a href={LINKS.github} className="secondary" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>

      <div className="hub-viz">
        <section className="viz-card">
          <header>
            <h2>What I ranked</h2>
            <p>
              {stats.n} quotes. {stats.genuinePct}% look like real intent. {stats.offPct}% decide off-app. Open Discovery
              to run the model on sample quotes.
            </p>
          </header>
          <HBars
            rows={["fit_uncertainty", "return_seal_tag_fear", "size_chart_distrust", "budget_sale_wait", "bookmark_only"].map((id) => {
              const o = OPPORTUNITIES.find((x) => x.id === id)!;
              return {
                id: o.id,
                label: o.name,
                value: o.score,
                note: o.disqualifiedMonetary ? "DISQ" : o.id === "fit_uncertainty" ? "PICKED" : undefined,
                tone: o.disqualifiedMonetary ? "disq" : o.id === "fit_uncertainty" ? "pick" : undefined,
              };
            })}
          />
        </section>
        <section className="viz-card">
          <header>
            <h2>Pages</h2>
            <p>Discovery, research, wishlist MVP, 10-slide deck.</p>
          </header>
          <Funnel
            steps={FLOW.map((s) => ({
              id: s.id,
              label: s.label,
              on: s.id === "discovery",
            }))}
          />
          <ol className="flow-list compact">
            {FLOW.map((s, i) => (
              <li key={s.id}>
                <Link href={s.href} className="flow-row">
                  <span className="flow-n">{i + 1}</span>
                  <span className="flow-copy">
                    <b>{s.label}</b>
                    <span>{s.blurb}</span>
                  </span>
                  <span className="flow-go">Open</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <h2 className="hub-sec">How I got to the bet</h2>
      <ThinkingEvo />
    </div>
  );
}
