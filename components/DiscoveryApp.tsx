"use client";

import { useEffect, useMemo, useState } from "react";
import { CORPUS, quotesFor } from "@/data/corpus";
import { OPPORTUNITIES } from "@/data/opportunities";
import { SAMPLE_QUOTES, classifyText, type Classification } from "@/lib/classify";
import { corpusStats, shareOf } from "@/lib/stats";
import type { BarrierId } from "@/data/types";

const STEPS = [
  { t: "Ingest", d: `Normalise ${CORPUS.length} public quotes with source URLs. Unit = a statement about a save, a delay, or a workaround — not a star.` },
  { t: "Extract", d: "Code job, barrier, genuine vs bookmark, off-app workaround, severity, metric proximity (does this block bagging an already saved SKU in 30 days?)." },
  { t: "Score", d: "F × S × M × N, each 1–5. N = 1 if only a coupon would move it." },
  { t: "Decide", d: "Highest score with N ≥ 4. Rank sale-wait in public. Do not ship it." },
];

export function DiscoveryApp() {
  const [phase, setPhase] = useState(0);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<"rank" | "matrix" | "evidence" | "compare" | "try" | "method">("rank");
  const [picked, setPicked] = useState<BarrierId>("fit_uncertainty");
  const [left, setLeft] = useState<BarrierId>("fit_uncertainty");
  const [right, setRight] = useState<BarrierId>("budget_sale_wait");
  const [paste, setPaste] = useState(SAMPLE_QUOTES[0].text);
  const [result, setResult] = useState<Classification | null>(null);
  const [sourceFilter, setSourceFilter] = useState("All");
  const stats = corpusStats();

  useEffect(() => {
    setRunning(true);
    setPhase(0);
    const id = window.setInterval(() => {
      setPhase((p) => {
        if (p >= 4) {
          window.clearInterval(id);
          setRunning(false);
          return 4;
        }
        return p + 1;
      });
    }, 420);
    return () => window.clearInterval(id);
  }, []);

  const sources = useMemo(() => ["All", ...Array.from(new Set(CORPUS.map((c) => c.source)))], []);
  const evidence = quotesFor(picked).filter((q) => sourceFilter === "All" || q.source === sourceFilter);
  const oLeft = OPPORTUNITIES.find((o) => o.id === left)!;
  const oRight = OPPORTUNITIES.find((o) => o.id === right)!;

  function runClassify(text: string) {
    setPaste(text);
    setResult(classifyText(text));
    setTab("try");
  }

  return (
    <div className="wide-shell">
      <div className="why-head">
        <div>
          <p className="hub-kicker">WhyWait · discovery engine</p>
          <h1 className="hub-title" style={{ fontSize: 18 }}>
            Why they wait — scored against 30-day wishlist purchase, not stars
          </h1>
          <p className="muted">
            {stats.n} quotes · {stats.genuinePct}% genuine intent · {stats.offPct}% leave the app to decide. No API key.
            Paste a review and watch it hit the metric tree.
          </p>
        </div>
        <button
          className="secondary"
          type="button"
          style={{ width: "auto", minWidth: 160 }}
          onClick={() => {
            setRunning(true);
            setPhase(0);
            let p = 0;
            const id = window.setInterval(() => {
              p += 1;
              setPhase(p);
              if (p >= 4) {
                window.clearInterval(id);
                setRunning(false);
              }
            }, 380);
          }}
        >
          {running ? "Running…" : "Re-run pipeline"}
        </button>
      </div>

      <ol className="pipe">
        {STEPS.map((step, i) => (
          <li key={step.t} className={phase > i ? "done" : phase === i && running ? "now" : ""}>
            <b>
              {i + 1}. {step.t}
            </b>
            <span>{step.d}</span>
          </li>
        ))}
      </ol>

      {phase >= 4 ? (
        <div className="callout">
          <b>Bet locked.</b> Fit uncertainty (625) + return/seal-tag fear (400). Sale-wait is {stats.salePct}% of corpus
          and DISQUALIFIED. Bookmark-only is quarantined, not converted.
        </div>
      ) : null}

      <div className="kpi" style={{ marginTop: 16 }}>
        <div>
          <span>Quotes</span>
          <b>{stats.n}</b>
        </div>
        <div>
          <span>Genuine intent</span>
          <b>{stats.genuinePct}%</b>
        </div>
        <div>
          <span>Off-app workaround</span>
          <b>{stats.offPct}%</b>
        </div>
        <div>
          <span>Fit language</span>
          <b>{stats.fitPct}%</b>
        </div>
      </div>

      <div className="filters" style={{ marginTop: 20 }}>
        {(
          [
            ["rank", "Ranked bets"],
            ["matrix", "2×2"],
            ["evidence", "Evidence"],
            ["compare", "Compare"],
            ["try", "Try a review"],
            ["method", "Method"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className={`filter ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "rank" && (
        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Opportunity</th>
                <th className="num">Share</th>
                <th className="num">F</th>
                <th className="num">S</th>
                <th className="num">M</th>
                <th className="num">N</th>
                <th className="num">Score</th>
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
                    setTab("evidence");
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <td>{i + 1}</td>
                  <td>
                    {o.name}
                    <div className="muted">{o.verdictAction}</div>
                  </td>
                  <td className="num">{shareOf(o.id)}%</td>
                  <td className="num">{o.f}</td>
                  <td className="num">{o.s}</td>
                  <td className="num">{o.m}</td>
                  <td className="num">{o.n}</td>
                  <td className="num">
                    <b>{o.score}</b>
                    <div className="inkbar" style={{ width: `${(o.score / 625) * 100}%` }} />
                  </td>
                  <td>{o.disqualifiedMonetary ? "DISQUALIFIED" : i === 0 ? "PICKED" : i === 1 ? "CO-PRIMARY" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted" style={{ marginTop: 8 }}>
            Tap a row for verbatim evidence. Score is not a heatmap. Magnitude is the number and the bar length.
          </p>
        </div>
      )}

      {tab === "matrix" && (
        <div style={{ marginTop: 12 }}>
          <p>
            Horizontal: metric proximity (does it block a <i>saved</i> purchase in 30d). Vertical: non-monetary
            solvability. Size: frequency. The legal bet sits top-right. Sale-wait sits far right and on the floor.
          </p>
          <div className="matrix">
            <span className="mx-y">Solvable without paying →</span>
            {OPPORTUNITIES.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`mx-dot ${o.disqualifiedMonetary ? "mx-disq" : o.id === "fit_uncertainty" ? "mx-pick" : ""}`}
                style={{
                  left: `${((o.m - 1) / 4) * 86 + 6}%`,
                  bottom: `${((o.n - 1) / 4) * 78 + 10}%`,
                  width: 12 + o.f * 4,
                  height: 12 + o.f * 4,
                }}
                title={`${o.name} M=${o.m} N=${o.n} F=${o.f}`}
                onClick={() => {
                  setPicked(o.id);
                  setTab("evidence");
                }}
              >
                <span>{o.name.split(" ")[0]}</span>
              </button>
            ))}
            <span className="mx-x">← Blocks 30d conversion of a saved SKU</span>
          </div>
        </div>
      )}

      {tab === "evidence" && (
        <>
          <h2 style={{ fontSize: 16, margin: "12px 0 8px" }}>{OPPORTUNITIES.find((o) => o.id === picked)?.name}</h2>
          <p>{OPPORTUNITIES.find((o) => o.id === picked)?.whyScore}</p>
          <p style={{ margin: "8px 0 12px" }}>{OPPORTUNITIES.find((o) => o.id === picked)?.metricLink}</p>
          <div className="filters">
            {OPPORTUNITIES.map((o) => (
              <button key={o.id} type="button" className={`filter ${picked === o.id ? "on" : ""}`} onClick={() => setPicked(o.id)}>
                {o.name.split(" ")[0]}
              </button>
            ))}
          </div>
          <div className="filters">
            {sources.map((src) => (
              <button key={src} type="button" className={`filter ${sourceFilter === src ? "on" : ""}`} onClick={() => setSourceFilter(src)}>
                {src}
              </button>
            ))}
          </div>
          {evidence.map((q) => (
            <blockquote key={q.id} className="quote">
              <p>{q.text}</p>
              <p className="muted" style={{ marginTop: 6 }}>
                {q.source} · {q.date} · {q.segment} · {q.intent} intent · {q.workaround.split("_").join(" ")} · sev {q.severity} ·
                prox {q.metricProximity} ·{" "}
                <a href={q.sourceUrl} target="_blank" rel="noreferrer">
                  source
                </a>
              </p>
            </blockquote>
          ))}
        </>
      )}

      {tab === "compare" && (
        <>
          <p style={{ marginTop: 12 }}>
            The question is not “what do people complain about.” It is “what blocks bagging a SKU they already saved,
            that we are allowed to fix.”
          </p>
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
                  ["Score", String(oLeft.score), String(oRight.score)],
                  ["Corpus share", `${shareOf(left)}%`, `${shareOf(right)}%`],
                  ["Proximity to 30d bag", String(oLeft.m), String(oRight.m)],
                  ["Solvable without money", String(oLeft.n), String(oRight.n)],
                ] as const
              ).map((row) => (
                <tr key={row[0]}>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                </tr>
              ))}
              <tr>
                <td>Ship?</td>
                <td>{oLeft.disqualifiedMonetary ? "No — monetary" : oLeft.id === "fit_uncertainty" ? "Yes — primary" : "Supporting"}</td>
                <td>{oRight.disqualifiedMonetary ? "No — monetary" : "Only if it serves the fit bet"}</td>
              </tr>
              <tr>
                <td>Moves the north star by</td>
                <td>{oLeft.metricLink}</td>
                <td>{oRight.metricLink}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {tab === "try" && (
        <div style={{ marginTop: 12 }}>
          <p>
            This is the testable workflow. Classification is a weighted taxonomy mapped onto the same nine opportunities
            and the same metric tree — so a reviewer can paste language and see the product call, including
            disqualification. It is not a chat window.
          </p>
          <div className="filters">
            {SAMPLE_QUOTES.map((s) => (
              <button key={s.label} type="button" className="filter" onClick={() => runClassify(s.text)}>
                Try: {s.label}
              </button>
            ))}
          </div>
          <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={5} style={{ width: "100%", marginTop: 8, padding: 8 }} />
          <button className="primary" type="button" style={{ marginTop: 8, maxWidth: 280 }} disabled={!paste.trim()} onClick={() => setResult(classifyText(paste))}>
            Classify against the metric
          </button>
          {result ? (
            <div className="card" style={{ marginTop: 16 }}>
              <p>
                <b>{result.opportunityName}</b> · {result.confidence} confidence · intent {result.intentGuess}
                {result.disqualifiedMonetary ? " · DISQUALIFIED" : ""}
                {result.secondary ? ` · also ${result.secondary.split("_").join(" ")}` : ""}
              </p>
              <p style={{ marginTop: 8 }}>{result.productCall}</p>
              <p style={{ marginTop: 8 }}>{result.metricLink}</p>
              <table className="table" style={{ marginTop: 12 }}>
                <thead>
                  <tr>
                    <th>Barrier</th>
                    <th className="num">Weight</th>
                    <th>Hits</th>
                    <th>Ship lens</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((b) => (
                    <tr key={b.id} className={b.id === result.barrier ? "picked" : b.disqualifiedMonetary ? "disq" : ""}>
                      <td>{b.name}</td>
                      <td className="num">{b.weight}</td>
                      <td>{b.hits.join(", ") || "—"}</td>
                      <td>{b.disqualifiedMonetary ? "Illegal" : b.weight === 0 ? "—" : "Legal"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}

      {tab === "method" && (
        <div style={{ marginTop: 12 }}>
          <p>
            Corpus is public UGC (App Store, Play Store, Trustpilot, complaints, Reddit-style threads, haul comments,
            Threads). Complainers over-index. That bias matches the target (metro women who stall), not all of India.
          </p>
          <ul>
            <li>Stars are discarded. A 5-star “sized up and loved it” is still fit_uncertainty with high proximity.</li>
            <li>Intent is genuine / bookmark / mixed. Bookmarks are a guardrail population.</li>
            <li>Workarounds (WhatsApp, hauls, two sizes, EORS, abandon) tell us the job the product must replace.</li>
            <li>Interviews lock the segment; they do not set F. F comes from corpus share.</li>
            <li>Runtime classifier is deterministic so evaluators do not need a model key. Same opportunity set as the ranked table.</li>
          </ul>
          <p>
            Limits: not a random sample; not Myntra telemetry; ethnic vs western mix is fashion-UGC heavy. If internal
            data showed sale-wait dominating even among users who never use EORS, we would still not ship a coupon — we
            would revisit whether fit is the second lever or return-risk is.
          </p>
        </div>
      )}
    </div>
  );
}
