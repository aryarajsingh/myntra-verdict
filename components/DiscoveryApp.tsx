"use client";

import { useMemo, useState } from "react";
import { CORPUS, quotesFor } from "@/data/corpus";
import { OPPORTUNITIES } from "@/data/opportunities";
import { classifyText } from "@/lib/classify";
import type { BarrierId } from "@/data/types";

const SECTIONS = ["overview", "barriers", "evidence", "compare", "classify", "method"] as const;

export function DiscoveryApp() {
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("overview");
  const [picked, setPicked] = useState<BarrierId>("fit_uncertainty");
  const [left, setLeft] = useState<BarrierId>("fit_uncertainty");
  const [right, setRight] = useState<BarrierId>("budget_sale_wait");
  const [paste, setPaste] = useState("");
  const [result, setResult] = useState<ReturnType<typeof classifyText> | null>(null);
  const [sourceFilter, setSourceFilter] = useState("All");

  const sources = useMemo(() => ["All", ...Array.from(new Set(CORPUS.map((c) => c.source)))], []);
  const evidence = quotesFor(picked).filter((q) => sourceFilter === "All" || q.source === sourceFilter);
  const oLeft = OPPORTUNITIES.find((o) => o.id === left)!;
  const oRight = OPPORTUNITIES.find((o) => o.id === right)!;
  const intentShare = Math.round((CORPUS.filter((c) => c.intent === "genuine").length / CORPUS.length) * 100);
  const offPlatform = Math.round(
    (CORPUS.filter((c) => ["whatsapp_friends", "youtube_haul", "instagram", "size_chart_google", "store_tryon"].includes(c.workaround)).length /
      CORPUS.length) *
      100
  );

  return (
    <div className="wide-shell">
      <div className="dash-grid">
        <aside className="side">
          <p style={{ fontWeight: 700, fontSize: 16 }}>WhyWait</p>
          <p className="muted">Discovery engine · CONCEPT</p>
          <p style={{ margin: "12px 0" }}>Reads why saved fashion sits, not star ratings.</p>
          {SECTIONS.map((s) => (
            <a key={s} href={`#${s}`} className={section === s ? "on" : ""} onClick={() => setSection(s)}>
              {s[0].toUpperCase() + s.slice(1)}
            </a>
          ))}
        </aside>
        <div className="main">
          <p className="chip chip-explore">CONCEPT</p>
          <h1 style={{ fontSize: 18, margin: "8px 0 4px" }}>Discovery engine</h1>
          <p className="muted">
            {CORPUS.length} public quotes · scored against 30-day wishlist → purchase · no API key required
          </p>

          {section === "overview" && (
            <>
              <div className="kpi" style={{ marginTop: 16 }}>
                <div>
                  <span>Quotes in corpus</span>
                  <b>{CORPUS.length}</b>
                </div>
                <div>
                  <span>Opportunities ranked</span>
                  <b>9</b>
                </div>
                <div>
                  <span>Genuine-intent share</span>
                  <b>{intentShare}%</b>
                </div>
                <div>
                  <span>Leave-app workarounds</span>
                  <b>{offPlatform}%</b>
                </div>
              </div>
              <h2 style={{ fontSize: 16, margin: "24px 0 8px" }}>How WhyWait works</h2>
              <ol>
                <li>Ingest public conversations (stores, Reddit, hauls, complaints) as verbatim quotes with URLs.</li>
                <li>Extract job, barrier, intent (genuine vs bookmark), workaround, severity, metric proximity.</li>
                <li>
                  Score each opportunity: frequency × severity × metric proximity × non-monetary solvability (each 1–5).
                </li>
                <li>Rank. Disqualify monetary levers. Pick the highest score with solvability ≥ 4.</li>
              </ol>
              <div className="box" style={{ marginTop: 16 }}>
                <b>Why this is not sentiment analysis.</b>
                <p>
                  A 1-star return rant and a 5-star “loved it, sized up” can both be fit_uncertainty with high metric
                  proximity. Star rating is not the unit. Blocking an already-saved SKU inside 30 days is the unit.
                </p>
              </div>
              <p style={{ marginTop: 16 }}>
                Highest solvable: <b>Fit uncertainty (625)</b> bundled with <b>return/seal-tag fear (400)</b>. EORS wait
                is frequent and disqualified (N=1).
              </p>
            </>
          )}

          {section === "barriers" && (
            <>
              <h2 style={{ fontSize: 16, margin: "16px 0" }}>Barriers ranked against 30-day conversion</h2>
              <p className="muted">Score = F × S × M × N. Winner row marked PICKED. Sale-wait marked DISQUALIFIED.</p>
              <div style={{ overflowX: "auto", marginTop: 12 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Barrier</th>
                      <th className="num">F</th>
                      <th className="num">S</th>
                      <th className="num">M</th>
                      <th className="num">N</th>
                      <th className="num">Score</th>
                      <th>Quotes</th>
                      <th>Call</th>
                    </tr>
                  </thead>
                  <tbody>
                    {OPPORTUNITIES.map((o, i) => (
                      <tr
                        key={o.id}
                        className={o.disqualifiedMonetary ? "disq" : i === 0 ? "picked" : ""}
                        onClick={() => {
                          setPicked(o.id);
                          setSection("evidence");
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{i + 1}</td>
                        <td>
                          {o.name}
                          <div className="muted">{o.verdictAction}</div>
                        </td>
                        <td className="num">{o.f}</td>
                        <td className="num">{o.s}</td>
                        <td className="num">{o.m}</td>
                        <td className="num">{o.n}</td>
                        <td className="num">
                          <b>{o.score}</b>
                          <div
                            style={{
                              height: 8,
                              marginTop: 4,
                              background: "#282c3f",
                              opacity: 0.2,
                              width: `${(o.score / 625) * 100}%`,
                            }}
                          />
                        </td>
                        <td className="num">{quotesFor(o.id).length}</td>
                        <td>
                          {o.disqualifiedMonetary ? "DISQUALIFIED" : i === 0 ? "PICKED" : i === 1 ? "CO-PRIMARY" : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ marginTop: 12 }}>Tap a row to open evidence. Sale-wait is visible so we cannot pretend we missed it.</p>
            </>
          )}

          {section === "evidence" && (
            <>
              <h2 style={{ fontSize: 16, margin: "16px 0 8px" }}>Evidence: {OPPORTUNITIES.find((o) => o.id === picked)?.name}</h2>
              <p>{OPPORTUNITIES.find((o) => o.id === picked)?.whyScore}</p>
              <p style={{ margin: "8px 0" }}>{OPPORTUNITIES.find((o) => o.id === picked)?.metricLink}</p>
              <div className="filters">
                {OPPORTUNITIES.map((o) => (
                  <button key={o.id} type="button" className={`filter ${picked === o.id ? "on" : ""}`} onClick={() => setPicked(o.id)}>
                    {o.name.split(" ")[0]}
                  </button>
                ))}
              </div>
              <div className="filters">
                {sources.map((s) => (
                  <button key={s} type="button" className={`filter ${sourceFilter === s ? "on" : ""}`} onClick={() => setSourceFilter(s)}>
                    {s}
                  </button>
                ))}
              </div>
              <p className="muted">
                {evidence.length} quotes · swipe/scroll. Verbatim language from public threads, not a word cloud.
              </p>
              {evidence.map((q) => (
                <blockquote key={q.id} className="quote">
                  <p>{q.text}</p>
                  <p className="muted" style={{ marginTop: 6 }}>
                    {q.source} · {q.date} · {q.segment} · intent {q.intent} · workaround {q.workaround.split("_").join(" ")} ·
                    severity {q.severity} · proximity {q.metricProximity} ·{" "}
                    <a href={q.sourceUrl} target="_blank" rel="noreferrer">
                      source
                    </a>
                  </p>
                </blockquote>
              ))}
            </>
          )}

          {section === "compare" && (
            <>
              <h2 style={{ fontSize: 16, margin: "16px 0 8px" }}>Compare two opportunities</h2>
              <p>Ask: which one actually blocks bagging an already saved SKU in 30 days, without paying the user?</p>
              <div className="two" style={{ marginTop: 12 }}>
                <label>
                  Left
                  <select value={left} onChange={(e) => setLeft(e.target.value as BarrierId)} style={{ width: "100%", minHeight: 44 }}>
                    {OPPORTUNITIES.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.score})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Right
                  <select value={right} onChange={(e) => setRight(e.target.value as BarrierId)} style={{ width: "100%", minHeight: 44 }}>
                    {OPPORTUNITIES.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.score})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <table className="table" style={{ marginTop: 16 }}>
                <thead>
                  <tr>
                    <th>Lens</th>
                    <th>{oLeft.name}</th>
                    <th>{oRight.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ["Score", oLeft.score, oRight.score],
                      ["Frequency", oLeft.f, oRight.f],
                      ["Severity", oLeft.s, oRight.s],
                      ["Metric proximity", oLeft.m, oRight.m],
                      ["Non-monetary solvability", oLeft.n, oRight.n],
                      ["Quotes", quotesFor(left).length, quotesFor(right).length],
                    ] as const
                  ).map((row) => (
                    <tr key={row[0]}>
                      <td>{row[0]}</td>
                      <td>{row[1]}</td>
                      <td>{row[2]}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>Monetary?</td>
                    <td>{oLeft.disqualifiedMonetary ? "Yes — illegal for this brief" : "No"}</td>
                    <td>{oRight.disqualifiedMonetary ? "Yes — illegal for this brief" : "No"}</td>
                  </tr>
                  <tr>
                    <td>Why it moves NS</td>
                    <td>{oLeft.metricLink}</td>
                    <td>{oRight.metricLink}</td>
                  </tr>
                  <tr>
                    <td>Product move</td>
                    <td>{oLeft.verdictAction}</td>
                    <td>{oRight.verdictAction}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {section === "classify" && (
            <>
              <h2 style={{ fontSize: 16, margin: "16px 0 8px" }}>Paste a review — test the workflow</h2>
              <p>
                Taxonomy classifier (no API key). Maps language to an opportunity, then to the 30-day metric. Try: “I
                saved the kurta but I don’t know if M will fit my hips and I’m scared of seal tags.”
              </p>
              <textarea
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                rows={5}
                style={{ width: "100%", marginTop: 12, padding: 8 }}
                placeholder="Paste an App Store review, Reddit comment, or haul comment"
              />
              <button
                className="primary"
                type="button"
                style={{ marginTop: 8, maxWidth: 280 }}
                disabled={!paste.trim()}
                onClick={() => setResult(classifyText(paste))}
              >
                Classify against the metric
              </button>
              {result ? (
                <div className="card" style={{ marginTop: 16 }}>
                  <p>
                    <b>{result.opportunityName}</b> · confidence {result.confidence}
                    {result.disqualifiedMonetary ? " · DISQUALIFIED (monetary)" : ""}
                  </p>
                  <p style={{ marginTop: 8 }}>Hits: {result.hits.length ? result.hits.join(", ") : "none — defaulted to fit"}</p>
                  <p style={{ marginTop: 8 }}>{result.why}</p>
                  <p style={{ marginTop: 8 }}>{result.metricLink}</p>
                </div>
              ) : null}
            </>
          )}

          {section === "method" && (
            <>
              <h2 style={{ fontSize: 16, margin: "16px 0 8px" }}>Method and limits</h2>
              <p>
                Corpus is public UGC: App Store, Play Store, Trustpilot, consumer complaints, Reddit-style fashion
                threads, YouTube haul comments, Threads. Quotes are representative of those venues (verbatim patterns,
                cited venue URLs). This is not a random sample of all Myntra users.
              </p>
              <ul>
                <li>Unit of analysis: a statement that explains a save, a delay, or a workaround.</li>
                <li>Intent coded genuine / bookmark / mixed. Bookmarks are quarantined, not “converted”.</li>
                <li>Metric proximity 5 = blocks purchase of an already saved SKU inside 30 days.</li>
                <li>Non-monetary solvability 1 = only coupons/EORS would move it.</li>
                <li>Primary research (6 interviews) is a separate artefact used to lock the segment, not to score F.</li>
              </ul>
              <p>
                Bias: complainers over-index in stores; haul comments over-index young metro women — which matches the
                chosen segment, not all of India.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
