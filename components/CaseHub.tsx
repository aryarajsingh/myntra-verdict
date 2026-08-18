"use client";

import Link from "next/link";
import { ThinkingEvo } from "@/components/ThinkingEvo";
import { Funnel, HBars } from "@/components/Viz";
import { FLOW } from "@/lib/flow";
import { OPPORTUNITIES } from "@/data/opportunities";
import { corpusStats } from "@/lib/stats";

export function CaseHub() {
  const stats = corpusStats();

  return (
    <div className="hub">
      <p className="hub-kicker">NextLeap · Myntra Growth · not the Myntra app</p>
      <h1 className="display">Wishlist → buy in 30 days. I can’t use coupons.</h1>
      <p className="hub-lede">
        Metric: share of users who purchase at least one wishlisted item within 30 days of adding it. No coupons.
        Sale-wait is real. I ranked it and DISQUALIFIED it.
      </p>
      <p className="hub-lede">
        First the live model (send a review). Then the product (a wishlist with Verdict).
      </p>

      <div className="path-ctas hub-start">
        <Link href="/discovery/" className="primary">
          Try the live model
        </Link>
        <Link href="/wishlist/" className="text-link">
          Open the product
        </Link>
      </div>

      <details className="hub-fold">
        <summary>How I ranked (coded panel, not Groq)</summary>
        <div className="hub-viz" style={{ marginTop: 16 }}>
          <section className="viz-card">
            <header>
              <h2>What I ranked</h2>
              <p>
                {stats.n} quotes. {stats.genuinePct}% look like real intent. {stats.offPct}% decide off-app. Fit 625.
                Return / seal-tag 400. Sale DISQ.
              </p>
            </header>
            <HBars
              rows={["fit_uncertainty", "return_seal_tag_fear", "size_chart_distrust", "budget_sale_wait", "bookmark_only"].map(
                (id) => {
                  const o = OPPORTUNITIES.find((x) => x.id === id)!;
                  return {
                    id: o.id,
                    label: o.name,
                    value: o.score,
                    note: o.disqualifiedMonetary ? "DISQ" : o.id === "fit_uncertainty" ? "PICKED" : undefined,
                    tone: o.disqualifiedMonetary ? "disq" : o.id === "fit_uncertainty" ? "pick" : undefined,
                  };
                },
              )}
            />
          </section>
          <section className="viz-card">
            <header>
              <h2>On this site</h2>
              <p>Live model, product, research, deck.</p>
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
      </details>
    </div>
  );
}
