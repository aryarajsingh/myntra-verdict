"use client";

import Link from "next/link";
import { OPPORTUNITIES } from "@/data/opportunities";
import { corpusStats } from "@/lib/stats";

const s = corpusStats();

export function CaseHub() {
  return (
    <div className="hub">
      <p className="hub-kicker">Myntra Growth · concept case · not the live app</p>
      <h1 className="hub-title">The wishlist already holds the demand. Thirty days later, most of it is still a heart.</h1>
      <p className="hub-lede">
        North star: share of users who purchase at least one item they wishlisted, within 30 days of that add. Constraint:
        no coupons, cashback, or sale nudges. The bet: close fit and return-risk on the saved card — where Maya and Size
        Intelligence do not travel.
      </p>

      <div className="hub-actions">
        <Link href="/discovery" className="primary">
          1. Run WhyWait
        </Link>
        <Link href="/wishlist" className="secondary">
          2. Use Verdict
        </Link>
        <Link href="/deck" className="secondary">
          3. Open the deck
        </Link>
      </div>
      <p className="muted" style={{ marginTop: 8 }}>
        Evaluators: WhyWait first (how we chose), Verdict second (what we shipped), deck last (the argument).{" "}
        <Link href="/research">Interview notes</Link>
        {" · "}
        <a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/Verdict-Wishlist-Deck.pdf`}>PDF</a>
      </p>

      <section className="hub-grid">
        <article className="hub-card">
          <p className="muted">Metric tree — where conversion dies</p>
          <ol className="hub-funnel">
            <li>Revisit the saved item in 30 days</li>
            <li className="on">Close uncertainty in-app (fit + return path)</li>
            <li className="on">Choose among saved substitutes</li>
            <li>Bag with a named size</li>
            <li>Pay</li>
          </ol>
          <p>P2 (stock) we observe. P3 (bookmark) we quarantine. We do not nag Pinterest hearts.</p>
        </article>
        <article className="hub-card">
          <p className="muted">WhyWait on {s.n} public quotes</p>
          <p>
            <b>{s.genuinePct}%</b> genuine intent · <b>{s.offPct}%</b> leave the app to decide · <b>{s.fitPct}%</b> fit
            language · <b>{s.salePct}%</b> sale-wait
          </p>
          <p style={{ marginTop: 8 }}>
            Sale-wait is frequent and <b>disqualified</b> (solvability = 1). Highest legal score: fit 625, return/seal-tag
            400.
          </p>
        </article>
        <article className="hub-card">
          <p className="muted">Primary research — six metro women 24–32</p>
          <p>
            PDP size advice does not persist on the heart. Exchange-only and seal-tag are discovered too late. Charts are
            “theatre.” Bookmarks must not be converted.
          </p>
          <p style={{ marginTop: 8 }}>
            Sneha: “I have the money. I don’t have another Sunday for a reverse pickup.”
          </p>
        </article>
      </section>

      <section className="hub-bet">
        <h2>The product outcome</h2>
        <p>
          Raise 30-day wishlist purchase by moving <b>revisit → confident size → bag</b> for genuine-intent workwear and
          everyday ethnic. Not by paying for conversion. Not by rebuilding Maya. Not by filtering a graveyard.
        </p>
        <table className="table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>We will not build</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>EORS timers, price-drop alerts, coupons</td>
              <td>Brief forbids it. WhyWait still ranks it so the miss is visible.</td>
            </tr>
            <tr>
              <td>PDP virtual try-on / photo avatar</td>
              <td>Myntra already ships size explainability on ~85% of eligible apparel. Gap is post-save.</td>
            </tr>
            <tr>
              <td>Wishlist folders and bulk filters</td>
              <td>Clutter score 72. A tidy graveyard still does not pick a size.</td>
            </tr>
            <tr>
              <td>Bag CTAs on Still exploring</td>
              <td>Wrong population. Over-nudge is a kill criterion.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="hub-bet">
        <h2>How the thinking moved</h2>
        <ol>
          <li>
            <b>Business metric</b> → user-level 30d purchase of a wishlisted SKU, not “bought anything on Myntra.”
          </li>
          <li>
            <b>Product outcomes</b> → leak is after save, before bag. Highest non-monetary levers: P4 + P5.
          </li>
          <li>
            <b>WhyWait</b> → fit and return-risk outrank clutter and styling; sale-wait is #1 frequency and illegal.
          </li>
          <li>
            <b>Interviews</b> → freeze is “I cannot relitigate size on the heart, and a bad return feels like losing
            money.” Kavya is a bookmark; she is not the target.
          </li>
          <li>
            <b>Problem</b> → wishlist stores intent; it does not close uncertainty.
          </li>
          <li>
            <b>Verdict</b> → a decision object on the saved item: fit analog, named size, return class in words, compare
            on fit not discount.
          </li>
        </ol>
      </section>

      <section className="hub-bet">
        <h2>What “good” looks like in an experiment</h2>
        <p>
          Success is north-star lift with <b>flat or down</b> size-related returns. Weekly proxy: size-accepted bag-add
          from Verdict. Kill if exploring users get bag CTAs, or if Verdict-attributed size returns exceed control by 50
          bps. Copy stays calibrated: likely, not guaranteed.
        </p>
        <div className="hub-actions" style={{ marginTop: 16 }}>
          <Link href="/discovery" className="primary">
            Test the engine
          </Link>
          <Link href="/wishlist" className="secondary">
            Open the wishlist
          </Link>
        </div>
      </section>

      <p className="muted" style={{ marginTop: 32 }}>
        Opportunity ranking used in WhyWait (score = F×S×M×N):{" "}
        {OPPORTUNITIES.map((o) => `${o.name.split(" ")[0]} ${o.score}`).join(" · ")}
      </p>
    </div>
  );
}
