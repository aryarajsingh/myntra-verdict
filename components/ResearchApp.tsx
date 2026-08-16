"use client";

import { INTERVIEWS } from "@/data/interviews";
import { OPPORTUNITIES } from "@/data/opportunities";

export function ResearchApp() {
  return (
    <div className="wide-shell" style={{ padding: 24 }}>
      <p className="chip chip-explore">PRIMARY RESEARCH</p>
      <h1 style={{ fontSize: 18, margin: "8px 0" }}>Six metro working women leave Myntra to decide if it will fit</h1>
      <p>
        Segment: women 24–32 in Bengaluru, Mumbai, Delhi, Pune, Hyderabad, Gurugram. Weekly Myntra use. 15+ wishlist
        items. Mix of workwear and occasion.
      </p>
      <h2 style={{ fontSize: 16, margin: "20px 0 8px" }}>What changed after the interviews</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Hypothesis from WhyWait</th>
            <th>What interviews did</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Fit is the legal #1</td>
            <td>Confirmed — but the failure is specifically <b>at revisit</b>. PDP advice does not travel with the heart.</td>
          </tr>
          <tr>
            <td>Return/seal-tag is co-primary</td>
            <td>Confirmed as time-cost and money-loss, not policy trivia. Sneha will pay full price if the Sunday is safe.</td>
          </tr>
          <tr>
            <td>Sale-wait is the frequent #1</td>
            <td>Priya named sale as <b>risk-offset</b>, not greed. Still illegal to ship. Do not confuse with the job.</td>
          </tr>
          <tr>
            <td>Bookmarks pollute the funnel</td>
            <td>Kavya: ~10 of 96 items were ever intent. Converting her is a false north star.</td>
          </tr>
          <tr>
            <td>Comparison is secondary</td>
            <td>Meera will buy one of three trousers if compared on fit, not discount.</td>
          </tr>
        </tbody>
      </table>
      <h2 style={{ fontSize: 16, margin: "20px 0 8px" }}>Synthesis</h2>
      <ul>
        <li>
          <b>Lock:</b> Fit uncertainty at revisit + return/seal-tag fear. Size advice from PDP does not travel with the
          saved card.
        </li>
        <li>
          <b>Do not serve:</b> Bookmark-only (Kavya). Nagging them poisons the product.
        </li>
        <li>
          <b>Disconfirming:</b> Sale-wait is real (Priya named it as risk-offset, not greed). Disqualified by constraint.
        </li>
        <li>
          <b>Comparison:</b> Meera will buy one of three trousers if compared on fit, not discount.
        </li>
      </ul>
      <div style={{ overflowX: "auto", marginTop: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Person</th>
              <th>Still intend?</th>
              <th>Primary freeze</th>
              <th>Outside app</th>
              <th>Would purchase if</th>
            </tr>
          </thead>
          <tbody>
            {INTERVIEWS.map((i) => (
              <tr key={i.id}>
                <td>
                  {i.name}, {i.age}, {i.city}
                  <div className="muted">{i.job}</div>
                </td>
                <td>{i.stillIntend}</td>
                <td>{OPPORTUNITIES.find((o) => o.id === i.barrier)?.name}</td>
                <td>{i.outsideApp}</td>
                <td>{i.wouldPurchase}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {INTERVIEWS.map((i) => (
        <article key={i.id} className="card" style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 16 }}>
            {i.name} · {i.age} · {i.city} · {i.job}
          </h2>
          <p className="muted">
            {i.myntraUse} · {i.wishlistCount}
          </p>
          <p style={{ marginTop: 8 }}>
            <b>Why saved.</b> {i.whySaved}
          </p>
          <p>
            <b>Still intend?</b> {i.stillIntend}
          </p>
          <p>
            <b>Stopping.</b> {i.stopping}
          </p>
          <p>
            <b>Would purchase if.</b> {i.wouldPurchase}
          </p>
          <p>
            <b>Info still needed.</b> {i.infoNeeded}
          </p>
          <p>
            <b>Alternatives.</b> {i.alternatives}
          </p>
          <p>
            <b>Outside the app.</b> {i.outsideApp}
          </p>
          <p>
            <b>How they cope.</b> {i.overcome}
          </p>
          {i.quotes.map((q) => (
            <blockquote key={q} className="quote">
              {q}
            </blockquote>
          ))}
        </article>
      ))}
    </div>
  );
}
