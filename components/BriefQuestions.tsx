"use client";

import { CORPUS } from "@/data/corpus";
import { OPPORTUNITIES } from "@/data/opportunities";
import {
  WHY_SAVED_LABEL,
  WORKAROUND_LABEL,
  barrierBySegment,
  corpusStats,
  mixOf,
  mixOfSlice,
  quoteById,
  roleRows,
  segmentBucket,
  shareOf,
  sourceCoverage,
} from "@/lib/stats";

function Evidence({ id }: { id: string }) {
  const q = quoteById(id);
  if (!q) return null;
  return (
    <blockquote className="quote">
      <p>{q.text}</p>
      <p className="muted" style={{ marginTop: 6 }}>
        {q.source} · {q.segment} · {q.intent} intent
      </p>
    </blockquote>
  );
}

export function BriefQuestions() {
  const stats = corpusStats();
  const why = mixOf((c) => WHY_SAVED_LABEL[c.whySaved]);
  const work = mixOf((c) => WORKAROUND_LABEL[c.workaround]);
  const intent = mixOf((c) => c.intent);
  const sources = mixOf((c) => c.source);
  const roles = roleRows();
  const segs = barrierBySegment();
  const coverage = sourceCoverage();

  return (
    <div className="tab-body" style={{ marginTop: 12 }}>
      <p>
        The assignment lists ten questions the engine must answer — not as sentiment, as scored opportunity. Each
        answer below is coded from {stats.n} public quotes, then ranked against the 30-day wishlist purchase metric.
      </p>

      <article className="brief-q">
        <p className="hub-kicker">Q1</p>
        <h2>Why do users add fashion products to their wishlist?</h2>
        <p>
          Five jobs, one heart button. Genuine buy-later is real. So is a moodboard, a sale-wait, an unscheduled
          occasion, and a shortlist of substitutes. Treating every heart as demand poisons the north star.
        </p>
        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Job of the save</th>
              <th className="num">Share</th>
              <th className="num">n</th>
            </tr>
          </thead>
          <tbody>
            {why.map((r) => (
              <tr key={r.key}>
                <td>{r.key}</td>
                <td className="num">{r.pct}%</td>
                <td className="num">{r.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Evidence id="k06" />
      </article>

      <article className="brief-q">
        <p className="hub-kicker">Q2</p>
        <h2>What prevents wishlisted products from eventually being purchased?</h2>
        <p>
          After save, the freeze is uncertainty on that SKU — not discovery. Ranked barriers (share of corpus, then
          F×S×M×N):
        </p>
        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Barrier</th>
              <th className="num">Share</th>
              <th className="num">Score</th>
              <th>Call</th>
            </tr>
          </thead>
          <tbody>
            {OPPORTUNITIES.map((o, i) => (
              <tr key={o.id} className={o.disqualifiedMonetary ? "disq" : i === 0 ? "picked" : ""}>
                <td>{o.name}</td>
                <td className="num">{shareOf(o.id)}%</td>
                <td className="num">{o.score}</td>
                <td>{o.disqualifiedMonetary ? "DISQUALIFIED" : i === 0 ? "PICKED" : i === 1 ? "CO-PRIMARY" : o.verdictAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Evidence id="f15" />
      </article>

      <article className="brief-q">
        <p className="hub-kicker">Q3</p>
        <h2>What uncertainties remain after users have identified a product they like?</h2>
        <p>
          They already like the photo. What remains: will this brand-cut fit <i>me</i>; can I send it back if it
          doesn’t; is the chart lying; will the fabric match the photo. Identification is done. The decision object is
          missing.
        </p>
        <ul>
          <li>Fit analog for their height / usual size ({stats.fitPct}% of corpus).</li>
          <li>Return class in words — easy / exchange-only / seal-tag ({stats.returnPct}%).</li>
          <li>Size-chart distrust ({stats.sizeChartPct}%) — cms that don’t match the garment.</li>
          <li>Quality vs photo ({stats.qualityPct}%) — weaker 30-day freeze than fit.</li>
        </ul>
        <Evidence id="f10" />
      </article>

      <article className="brief-q">
        <p className="hub-kicker">Q4</p>
        <h2>What causes users to postpone a purchase?</h2>
        <p>
          Three clocks, only one we are allowed to fix. Fit/return freeze until they “feel sure” (they never do). Sale
          wait ({stats.salePct}% of corpus) — ranked and refused. Occasion wait — often longer than 30 days by design.
        </p>
        <Evidence id="f39" />
      </article>

      <article className="brief-q">
        <p className="hub-kicker">Q5</p>
        <h2>How do users compare multiple shortlisted products?</h2>
        <p>
          They save 2–4 substitutes for one job (office trousers, wedding kurta) and bag none. Comparison paralysis is{" "}
          {stats.comparePct}% of corpus (score 144). They compare in WhatsApp and Notes. Discount % makes it worse.
          Fit + occasion + return path is the legal compare.
        </p>
        <Evidence id="f03" />
      </article>

      <article className="brief-q">
        <p className="hub-kicker">Q6</p>
        <h2>What information do users seek outside Myntra before purchasing?</h2>
        <p>
          {stats.offPct}% of the corpus leaves the app to decide. That loop is why 30 days die. What they seek: someone
          with their height in the garment, a friend who owns the brand, a chart they might believe, fabric in a store.
        </p>
        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Off-app / cope</th>
              <th className="num">Share</th>
              <th className="num">n</th>
            </tr>
          </thead>
          <tbody>
            {work.map((r) => (
              <tr key={r.key}>
                <td>{r.key}</td>
                <td className="num">{r.pct}%</td>
                <td className="num">{r.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Evidence id="f11" />
      </article>

      <article className="brief-q">
        <p className="hub-kicker">Q7</p>
        <h2>What role do fit, size, styling, price, reviews, occasion and social validation play?</h2>
        <p>Each factor is coded. Only fit + return-risk are both high-proximity and legal to ship.</p>
        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Factor</th>
              <th>How coded</th>
              <th>Share</th>
              <th>Play vs 30-day metric</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.role} className={r.role === "Fit" ? "picked" : r.role === "Price" ? "disq" : ""}>
                <td>{r.role}</td>
                <td>{r.coded}</td>
                <td>{r.share}</td>
                <td>{r.play}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Evidence id="f29" />
      </article>

      <article className="brief-q">
        <p className="hub-kicker">Q8</p>
        <h2>When is the wishlist genuine purchase intent versus bookmarking?</h2>
        <p>
          Genuine {stats.genuinePct}% · bookmark {stats.bookmarkIntentPct}% · mixed {stats.mixedPct}%. Bookmark-only as
          a barrier is {stats.bookmarkPct}% of quotes (score 32). Converting Kavya’s moodboard is a false north star.
          Still exploring has no bag CTA on purpose.
        </p>
        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Intent code</th>
              <th className="num">Share</th>
              <th className="num">n</th>
            </tr>
          </thead>
          <tbody>
            {intent.map((r) => (
              <tr key={r.key}>
                <td>{r.key}</td>
                <td className="num">{r.pct}%</td>
                <td className="num">{r.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Evidence id="k01" />
      </article>

      <article className="brief-q">
        <p className="hub-kicker">Q9</p>
        <h2>How do these behaviors differ across user segments?</h2>
        <p>
          Public UGC over-indexes on metro women who stall — that matches the target, not all of India. Younger save
          more as moodboard. 28–40 talk return time-cost louder. I locked interviews on women 24–32 metro with 15+
          saves (workwear + occasion). I did not pick a segment I never heard.
        </p>
        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Segment in corpus</th>
              <th className="num">Share</th>
              <th>Top barrier</th>
              <th className="num">Genuine</th>
              <th className="num">Off-app</th>
            </tr>
          </thead>
          <tbody>
            {segs.map((s) => (
              <tr key={s.segment} className={s.segment.includes("24–32") ? "picked" : ""}>
                <td>
                  {s.segment}
                  {s.segment.includes("24–32") ? " · TARGET" : ""}
                </td>
                <td className="num">
                  {s.pct}% ({s.n})
                </td>
                <td>
                  {s.topBarrier} ({s.topShare}%)
                </td>
                <td className="num">{s.genuinePct}%</td>
                <td className="num">{s.offPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>

      <article className="brief-q">
        <p className="hub-kicker">Q10</p>
        <h2>What unmet needs emerge consistently?</h2>
        <ol>
          <li>A fit story that travels with the saved card (not only on PDP / Maya).</li>
          <li>Return / seal-tag / exchange-only in a sentence before bag, not an icon after pay.</li>
          <li>Compare saved substitutes on fit and occasion — never on discount %.</li>
          <li>Permission not to buy the moodboard. One heart is not one demand.</li>
        </ol>
        <p style={{ marginTop: 8 }}>
          Need 1 + 2 is Verdict. Need 3 is the compare strip. Need 4 is Still exploring. Coupons are not an unmet
          need we are allowed to fill.
        </p>
        <Evidence id="f37" />
      </article>

      <article className="brief-q">
        <p className="hub-kicker">Sources the brief named</p>
        <h2>Every required source class is in the corpus</h2>
        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Brief asked for</th>
              <th>In WhyWait as</th>
              <th className="num">n</th>
              <th className="num">Share</th>
            </tr>
          </thead>
          <tbody>
            {coverage.map((r) => (
              <tr key={r.brief}>
                <td>{r.brief}</td>
                <td>{r.sources}</td>
                <td className="num">{r.n}</td>
                <td className="num">{r.pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted" style={{ marginTop: 8 }}>
          Raw source mix (partition): {sources.map((s) => `${s.key} ${s.pct}%`).join(" · ")}. N = {CORPUS.length}.
        </p>
      </article>
    </div>
  );
}

export function SegmentsPanel() {
  const segs = barrierBySegment();
  const target = CORPUS.filter((c) => segmentBucket(c.segment) === "Women 24–32 metro");
  const whyByTarget = mixOfSlice(target, (c) => WHY_SAVED_LABEL[c.whySaved]);

  return (
    <div className="tab-body" style={{ marginTop: 12 }}>
      <p>
        Same ten questions, sliced by who is speaking. Interviews lock the 24–32 metro working-woman cell. Other
        slices are shown so the pick is a decision, not a default.
      </p>
      <table className="table" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>Segment</th>
            <th className="num">n</th>
            <th>Top barrier</th>
            <th className="num">Genuine intent</th>
            <th className="num">Leave app to decide</th>
          </tr>
        </thead>
        <tbody>
          {segs.map((s) => (
            <tr key={s.segment} className={s.segment.includes("24–32") ? "picked" : ""}>
              <td>{s.segment}</td>
              <td className="num">{s.n}</td>
              <td>
                {s.topBarrier} ({s.topShare}%)
              </td>
              <td className="num">{s.genuinePct}%</td>
              <td className="num">{s.offPct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 style={{ fontSize: 16, margin: "20px 0 8px" }}>Why the target saves (24–32 metro in corpus)</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Job</th>
            <th className="num">Share of that slice</th>
          </tr>
        </thead>
        <tbody>
          {whyByTarget.map((r) => (
            <tr key={r.key}>
              <td>{r.key}</td>
              <td className="num">{r.pct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted" style={{ marginTop: 8 }}>
        Caveat: complainers over-index. F is corpus share, not Myntra telemetry. Interviews do not set F; they lock
        the mechanism (freeze at revisit).
      </p>
    </div>
  );
}
