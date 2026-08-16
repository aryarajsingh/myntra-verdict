"use client";

import Link from "next/link";

const FOOT = "CONCEPT · Verdict · NextLeap case · Not the Myntra app";
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

function Foot({ n }: { n: number }) {
  return (
    <div className="slide-foot">
      {n} / 10 · {FOOT}
    </div>
  );
}

export function DeckApp() {
  return (
    <div className="deck-page">
      <div className="print-bar no-print">
        <span>10 slides · 14pt · File → Print → Save as PDF (landscape)</span>
        <span>
          <a href={`${base}/Verdict-Wishlist-Deck.pdf`} className="secondary" style={{ width: "auto", display: "inline-flex" }}>
            Download PDF
          </a>{" "}
          <button className="secondary" type="button" style={{ width: "auto" }} onClick={() => window.print()}>
            Print / Save PDF
          </button>
        </span>
      </div>

      <section className="slide">
        <h1>High-intent demand is already on the wishlist; the leak is 30-day purchase</h1>
        <div className="rule" />
        <div className="two">
          <div>
            <p>
              Myntra Growth. North star: share of users who purchase at least one item they wishlisted, within 30 days of
              that add.
            </p>
            <p style={{ marginTop: 12 }}>
              Users heart with intent, then stall. Frequency and GMV sit on demand the platform already captured. The
              job is not more discovery. The job is closing a saved decision.
            </p>
            <p style={{ marginTop: 12 }}>
              Constraint: no coupons, cashback, EORS timers, or invented discounts. Price-wait is real. We are not
              allowed to buy the conversion.
            </p>
          </div>
          <div className="box">
            <p style={{ fontWeight: 700 }}>Verdict</p>
            <p>Wishlist decision layer (concept prototype)</p>
            <p style={{ marginTop: 12 }}>
              Live: <Link href="/">wishlist MVP</Link>, <Link href="/discovery">WhyWait engine</Link>,{" "}
              <Link href="/research">six interviews</Link>,{" "}
              <a href={`${base}/Verdict-Wishlist-Deck.pdf`}>this deck (PDF)</a>.
            </p>
            <p style={{ marginTop: 12 }}>Not the Myntra app. Eval only.</p>
          </div>
        </div>
        <Foot n={1} />
      </section>

      <section className="slide">
        <h1>Conversion dies after save: revisit → pick a size → bag → pay</h1>
        <div className="rule" />
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product outcome</th>
              <th>What must change</th>
              <th>MVP?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>P1</td>
              <td>Revisit saved demand in 30d</td>
              <td>Open wishlist again</td>
              <td>Observe</td>
            </tr>
            <tr>
              <td>P2</td>
              <td>Still eligible</td>
              <td>Size in stock</td>
              <td>Observe; no silent size swap</td>
            </tr>
            <tr>
              <td>P3</td>
              <td>Intent, not bookmark</td>
              <td>Detect. Do not nag moodboards</td>
              <td>Still exploring bucket</td>
            </tr>
            <tr className="picked">
              <td>P4</td>
              <td>Close uncertainty in-app</td>
              <td>Fit story + return/seal-tag on the saved SKU</td>
              <td>PICKED</td>
            </tr>
            <tr className="picked">
              <td>P5</td>
              <td>Choose among substitutes</td>
              <td>Fit + occasion compare, never discount %</td>
              <td>PICKED</td>
            </tr>
            <tr>
              <td>P6</td>
              <td>Bag with a size</td>
              <td>CTA names the size</td>
              <td>Add M to bag</td>
            </tr>
            <tr>
              <td>P7</td>
              <td>Pay</td>
              <td>Standard checkout</td>
              <td>Out of prototype</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: 12 }}>Drop-off between Verdict open and size-accept is the product bug.</p>
        <Foot n={2} />
      </section>

      <section className="slide">
        <h1>WhyWait ranks why they wait — not star ratings</h1>
        <div className="rule" />
        <div className="two">
          <div>
            <p style={{ fontWeight: 700 }}>Pipeline</p>
            <ol>
              <li>Ingest public quotes with source URLs (stores, Reddit, hauls, complaints).</li>
              <li>Extract job, barrier, genuine vs bookmark, workaround, severity, metric proximity.</li>
              <li>Score = frequency × severity × proximity × non-monetary solvability (1–5).</li>
              <li>Compare opportunities. Disqualify monetary. Pick solvability ≥ 4.</li>
            </ol>
            <p style={{ marginTop: 12 }}>
              A 5-star “sized up and loved it” is still fit_uncertainty. Stars are not the unit. Blocking an already
              saved SKU inside 30 days is the unit.
            </p>
          </div>
          <div className="box">
            <p style={{ fontWeight: 700 }}>Test the engine</p>
            <p>
              Open <Link href="/discovery">/discovery</Link>
            </p>
            <p>Rank table · evidence quotes · compare two barriers · paste a review</p>
            <p style={{ marginTop: 12 }}>Runs with no API key. Taxonomy classifier you can try live.</p>
          </div>
        </div>
        <Foot n={3} />
      </section>

      <section className="slide">
        <h1>Fit uncertainty + return/seal-tag fear beat every lever we are allowed to pull</h1>
        <div className="rule" />
        <table className="table">
          <thead>
            <tr>
              <th>Barrier</th>
              <th>F</th>
              <th>S</th>
              <th>M</th>
              <th>N</th>
              <th>Score</th>
              <th>Call</th>
            </tr>
          </thead>
          <tbody>
            <tr className="picked">
              <td>Fit uncertainty</td>
              <td>5</td>
              <td>5</td>
              <td>5</td>
              <td>5</td>
              <td>625</td>
              <td>PICKED</td>
            </tr>
            <tr>
              <td>Return / seal-tag fear</td>
              <td>4</td>
              <td>5</td>
              <td>5</td>
              <td>4</td>
              <td>400</td>
              <td>CO-PRIMARY</td>
            </tr>
            <tr>
              <td>Size-chart distrust</td>
              <td>4</td>
              <td>4</td>
              <td>5</td>
              <td>4</td>
              <td>320</td>
              <td>Input to fit story</td>
            </tr>
            <tr>
              <td>Comparison paralysis</td>
              <td>3</td>
              <td>3</td>
              <td>4</td>
              <td>4</td>
              <td>144</td>
              <td>Compare strip</td>
            </tr>
            <tr className="disq">
              <td>Budget / EORS wait</td>
              <td>5</td>
              <td>4</td>
              <td>5</td>
              <td>1</td>
              <td>100</td>
              <td>DISQUALIFIED</td>
            </tr>
            <tr>
              <td>Bookmark-only</td>
              <td>4</td>
              <td>2</td>
              <td>2</td>
              <td>2</td>
              <td>32</td>
              <td>Quarantine, don’t convert</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: 12 }}>Sale-wait is frequent. We ranked it. We refused it. N=1 under the constraint.</p>
        <Foot n={4} />
      </section>

      <section className="slide">
        <h1>Six metro working women leave Myntra to decide if it will fit</h1>
        <div className="rule" />
        <table className="table">
          <thead>
            <tr>
              <th>Who</th>
              <th>Still intend?</th>
              <th>Freeze</th>
              <th>Outside the app</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ananya, 27, Bengaluru</td>
              <td>Work shirt, trousers — yes</td>
              <td>PDP size story gone on wishlist</td>
              <td>WhatsApp + office hauls</td>
            </tr>
            <tr>
              <td>Riya, 25, Mumbai</td>
              <td>One ethnic set in 18 days</td>
              <td>Exchange-only, seal-tag</td>
              <td>Instagram, family chat, store touch</td>
            </tr>
            <tr>
              <td>Meera, 30, Delhi</td>
              <td>One of three trousers</td>
              <td>Charts are theatre</td>
              <td>Google + tape on a kept pair</td>
            </tr>
            <tr>
              <td>Priya, 28, Pune</td>
              <td>Kurta yes; saree no</td>
              <td>Ethnic size ≠ top size</td>
              <td>Petite hauls, sister</td>
            </tr>
            <tr>
              <td>Kavya, 24, Hyderabad</td>
              <td>~10 of 96 items</td>
              <td>Bookmark pile</td>
              <td>Hauls, then forgets</td>
            </tr>
            <tr>
              <td>Sneha, 32, Gurugram</td>
              <td>High, budget exists</td>
              <td>Return time-cost</td>
              <td>Forwards PDP, still stalls</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: 12 }}>
          Full notes: <Link href="/research">/research</Link>. They do not need a coupon. They need a decision object.
        </p>
        <Foot n={5} />
      </section>

      <section className="slide">
        <h1>The wishlist stores intent; it does not close fit or return risk</h1>
        <div className="rule" />
        <div className="two">
          <div>
            <p>
              <b>Segment.</b> Metro working women 24–32. 15+ saved items. Workwear plus occasion.
            </p>
            <p style={{ marginTop: 12 }}>
              <b>Outcome.</b> Raise 30-day wishlist → purchase via revisit → confident size → bag.
            </p>
            <p style={{ marginTop: 12 }}>
              <b>Root cause.</b> Size & Fit Intelligence and Maya live on PDP/search. That explanation does not travel
              with the saved card. Return/seal-tag is an icon, not a sentence. Uncertainty is resolved off-platform,
              slowly, past 30 days.
            </p>
          </div>
          <div>
            <p>
              <b>Workarounds.</b> WhatsApp photos, YouTube hauls, two-size orders, wait for EORS to offset return risk,
              abandon.
            </p>
            <p style={{ marginTop: 12 }}>
              <b>User value.</b> Decide in-app. Skip a failed try-on and a reverse-pickup Sunday.
            </p>
            <p style={{ marginTop: 12 }}>
              <b>Business value.</b> Convert demand already saved. Frequency and GMV without paying for conversion.
            </p>
          </div>
        </div>
        <Foot n={6} />
      </section>

      <section className="slide">
        <h1>Verdict sits on the saved item — not another PDP try-on, not EORS</h1>
        <div className="rule" />
        <div className="three">
          <div className="box">
            <p style={{ fontWeight: 700 }}>Not filters</p>
            <p>Clutter is real (score 72). Hygiene does not pick a size. A tidy graveyard is still a graveyard.</p>
          </div>
          <div className="box">
            <p style={{ fontWeight: 700 }}>Not PDP try-on</p>
            <p>
              Myntra already ships size explainability on ~85% of eligible apparel and is building Try On Me. The gap is
              post-save. Advice must persist on the hearted card.
            </p>
          </div>
          <div className="box">
            <p style={{ fontWeight: 700 }}>Not discounts</p>
            <p>
              EORS wait ranks high and is illegal for this brief. Sale as risk-offset is a symptom of return fear, not
              the product we ship.
            </p>
          </div>
        </div>
        <p style={{ marginTop: 16 }}>
          Verdict is a decision object: fit analog (kept / exchanged / returned) + suggested size with “not a guarantee”
          + return class in words + saved-substitute compare on fit and occasion.
        </p>
        <Foot n={7} />
      </section>

      <section className="slide">
        <h1>Three buckets, one decision: Ready / Check fit / Still exploring</h1>
        <div className="rule" />
        <table className="table">
          <thead>
            <tr>
              <th>Bucket</th>
              <th>Signal (word + shape, not colour alone)</th>
              <th>Rule</th>
              <th>CTA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>READY</td>
              <td>Filled chip + word READY (blue)</td>
              <td>Intent + high fit analog + easy return</td>
              <td>Add M to bag</td>
            </tr>
            <tr>
              <td>CHECK FIT</td>
              <td>Triangle chip + words CHECK FIT (amber)</td>
              <td>New brand, mixed reviews, exchange-only</td>
              <td>See Verdict</td>
            </tr>
            <tr>
              <td>STILL EXPLORING</td>
              <td>Dashed chip + STILL EXPLORING (gray)</td>
              <td>Bookmark, seal-tag occasion, OOS usual size</td>
              <td>Keep saving — no bag push</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: 12 }}>
          Prototype: <Link href="/">Wishlist MVP</Link> · Onboarding (sizes, height, fit pref, no photo) · item Verdict ·
          compare · Ask a doubt (precomputed) · bag (no checkout). Engine: <Link href="/discovery">WhyWait</Link>.
        </p>
        <Foot n={8} />
      </section>

      <section className="slide">
        <h1>Win size-accepted bag-add; keep size-related returns flat</h1>
        <div className="rule" />
        <table className="table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Type</th>
              <th>Definition</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>30d WL user purchase</td>
              <td>Lagging / NS</td>
              <td>User bought ≥1 of their WL items within 30d of that add</td>
              <td>The brief</td>
            </tr>
            <tr>
              <td>Size-accepted bag-add</td>
              <td>Leading</td>
              <td>Bag-add from Verdict with a confirmed size / Verdict opens</td>
              <td>Weekly proxy for NS</td>
            </tr>
            <tr>
              <td>Verdict open rate</td>
              <td>Leading</td>
              <td>Intent revisits that open the decision object</td>
              <td>Did we put it on the path?</td>
            </tr>
            <tr>
              <td>Compare completed</td>
              <td>Leading</td>
              <td>Finished substitute compare among ≥2 similar saves</td>
              <td>Paralysis</td>
            </tr>
            <tr>
              <td>Time-to-bag after revisit</td>
              <td>Leading</td>
              <td>Median minutes revisit → bag from Verdict</td>
              <td>In-app vs YouTube loop</td>
            </tr>
            <tr>
              <td>Size/fit return rate</td>
              <td>Guardrail</td>
              <td>Size-reason returns on Verdict-bagged lines vs control</td>
              <td>Overconfidence fakes NS</td>
            </tr>
            <tr>
              <td>Over-nudge</td>
              <td>Guardrail</td>
              <td>Bag CTAs shown to Still exploring</td>
              <td>Must be ~0</td>
            </tr>
          </tbody>
        </table>
        <Foot n={9} />
      </section>

      <section className="slide">
        <h1>It fails if we fake certainty or nag people who were only bookmarking</h1>
        <div className="rule" />
        <table className="table">
          <thead>
            <tr>
              <th>Risk</th>
              <th>Why it kills the metric</th>
              <th>Mitigation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Overconfident fit</td>
              <td>30d purchase then reverse pickup</td>
              <td>“Likely”, never guaranteed. Return card always. Weak analog → Check fit</td>
            </tr>
            <tr>
              <td>Bookmark spam</td>
              <td>Users ignore Wishlist</td>
              <td>Exploring has no primary bag CTA. One-tap Just saving</td>
            </tr>
            <tr>
              <td>“We already have size AI”</td>
              <td>Leadership kills the bet</td>
              <td>Post-save object + policy in words + saved-substitute compare</td>
            </tr>
            <tr>
              <td>Price-wait is actually #1</td>
              <td>Wrong problem narrative</td>
              <td>WhyWait ranks it DISQUALIFIED in public</td>
            </tr>
            <tr>
              <td>Prototype looks like phishing</td>
              <td>Trust, App Store risk</td>
              <td>Always-on “Not the Myntra app” bar. No login, no UPI</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: 12 }}>
          If this still feels off, don’t bag it. Brands still cut differently. Kept ≠ looked perfect.
        </p>
        <Foot n={10} />
      </section>
    </div>
  );
}
