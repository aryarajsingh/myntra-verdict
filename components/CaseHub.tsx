"use client";

import Link from "next/link";
import { LINKS } from "@/lib/links";

export function CaseHub() {
  return (
    <div className="hub">
      <p className="hub-kicker">Myntra Growth · concept prototype · not the live app</p>
      <h1 className="hub-title">Three artefacts. Same brief. No discounts.</h1>
      <p className="hub-lede">
        North star: % of users who purchase at least one wishlisted item within 30 days of adding it. We do not pay for
        that conversion. Fit and return-risk on the <b>saved</b> item is the bet.
      </p>

      <div className="deliverables">
        <article className="del-card">
          <p className="muted">Deliverable 1</p>
          <h2>AI discovery engine</h2>
          <p>
            WhyWait reads public fashion-shopping talk, scores why a saved item does not get bought in 30 days, and
            ranks bets you are allowed to ship. Paste a review to test it.
          </p>
          <Link href="/discovery" className="primary">
            Open WhyWait
          </Link>
        </article>
        <article className="del-card">
          <p className="muted">Deliverable 2</p>
          <h2>10-slide deck</h2>
          <p>
            Metric tree → engine findings → six interviews → problem → why Verdict → MVP → success metrics → risks. 14pt.
            Titles are the point.
          </p>
          <div className="hub-actions" style={{ marginTop: 12 }}>
            <a href={LINKS.pdf} className="primary">
              Download PDF
            </a>
            <Link href="/deck" className="secondary">
              View slides
            </Link>
          </div>
        </article>
        <article className="del-card">
          <p className="muted">Deliverable 3</p>
          <h2>Deployed MVP</h2>
          <p>
            Verdict on a Myntra-like wishlist. Ready / Check fit / Still exploring. Open a Check fit piece. No coupons,
            no checkout, no fake Myntra login.
          </p>
          <Link href="/wishlist" className="primary">
            Open Verdict
          </Link>
        </article>
      </div>

      <p className="muted" style={{ marginTop: 24 }}>
        Supporting: <Link href="/research">interview notes + discussion guide</Link>. Suggested order: engine → MVP →
        deck.
      </p>
    </div>
  );
}
