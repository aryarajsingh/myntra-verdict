"use client";

import { useEffect, useMemo, useState } from "react";
import { CORPUS, quotesFor } from "@/data/corpus";
import { OPPORTUNITIES } from "@/data/opportunities";
import { BriefQuestions, SegmentsPanel } from "@/components/BriefQuestions";
import { HBars, Scatter, Stacked } from "@/components/Viz";
import { type Classification } from "@/lib/classify";
import { EXTRACT_PROMPT } from "@/data/extract-prompt";
import { LINKS } from "@/lib/links";
import { apiPath } from "@/lib/api";
import { LIVE_BATTERY } from "@/lib/live-battery";
import type { PipeLog, PipeResult, PipeStage } from "@/lib/pipeline";
import { corpusStats, mixOf, shareOf, sourceCoverage } from "@/lib/stats";
import { buildVecModel, type VecModel } from "@/lib/vector";
import type { BarrierId } from "@/data/types";

const SHORT: Record<BarrierId, string> = {
  fit_uncertainty: "Fit",
  return_seal_tag_fear: "Return / seal-tag",
  size_chart_distrust: "Size chart",
  comparison_paralysis: "Compare",
  quality_doubt: "Quality",
  styling_occasion: "Occasion",
  budget_sale_wait: "Sale wait",
  wishlist_clutter: "Clutter",
  bookmark_only: "Bookmark",
};

const FIT = LIVE_BATTERY[0];
const EORS = LIVE_BATTERY.find((s) => s.label === "EORS wait")!;
const REST = LIVE_BATTERY.filter((s) => s.label !== FIT.label && s.label !== EORS.label);

function expectFor(id: BarrierId) {
  return id === "budget_sale_wait" ? `${SHORT[id]} · DISQ` : SHORT[id];
}

type Panel = "try" | "board" | "brief" | "method";
type Shot = { label: string; gold: BarrierId; pred: BarrierId; disq: boolean; ok: boolean };

export function DiscoveryApp() {
  const stats = corpusStats();
  const [running, setRunning] = useState(false);
  const [calling, setCalling] = useState(false);
  const [done, setDone] = useState<PipeResult | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [logs, setLogs] = useState<PipeLog[]>([]);
  const [tick, setTick] = useState({ i: 0, n: LIVE_BATTERY.length });
  const [model, setModel] = useState<VecModel | null>(null);
  const [picked, setPicked] = useState<BarrierId>("fit_uncertainty");
  const [panel, setPanel] = useState<Panel>("try");
  const [paste, setPaste] = useState(FIT.text);
  const [sentFit, setSentFit] = useState(false);
  const [result, setResult] = useState<Classification | null>(null);
  const [sourceFilter, setSourceFilter] = useState("All");
  const [err, setErr] = useState<string | null>(null);
  const [engine, setEngine] = useState<{ live: boolean; provider: string; model: string } | null>(null);
  const [extractMeta, setExtractMeta] = useState<{ provider: string; model: string; ms: number } | null>(null);

  const sources = useMemo(() => ["All", ...Array.from(new Set(CORPUS.map((c) => c.source)))], []);
  const evidence = quotesFor(picked).filter((q) => sourceFilter === "All" || q.source === sourceFilter);
  const intent = mixOf((c) => c.intent);
  const coverage = sourceCoverage();
  const opp = OPPORTUNITIES.find((o) => o.id === picked)!;
  const goldForPaste = LIVE_BATTERY.find((s) => s.text === paste);

  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (h === "try" || h === "brief" || h === "method" || h === "board") setPanel(h as Panel);
  }, []);

  useEffect(() => {
    setModel(buildVecModel());
  }, []);

  useEffect(() => {
    fetch(apiPath("/api/engine"))
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setEngine(j ?? { live: false, provider: "none", model: "unset" }))
      .catch(() => setEngine({ live: false, provider: "none", model: "unset" }));
  }, []);

  function go(p: Panel) {
    setPanel(p);
    window.history.replaceState(null, "", `#${p}`);
  }

  function pushLog(t0: number, stage: PipeStage, msg: string, ok?: boolean) {
    const row: PipeLog = { at: Date.now() - t0, stage, msg, ok };
    setLogs((xs) => [...xs.slice(-80), row]);
    return row;
  }

  async function runLive(): Promise<PipeResult> {
    const t0 = Date.now();
    const n = LIVE_BATTERY.length;
    setTick({ i: 0, n });
    setShots([]);
    pushLog(t0, "extract", `POST /api/extract × ${n}`);

    const predCount: Record<string, number> = {};
    const goldCount: Record<string, number> = {};
    for (const o of OPPORTUNITIES) {
      predCount[o.id] = 0;
      goldCount[o.id] = CORPUS.filter((q) => q.barrier === o.id).length;
    }

    let agree = 0;
    let provider = "none";
    let modelName = "unset";
    const rows: Shot[] = [];

    for (let i = 0; i < LIVE_BATTERY.length; i++) {
      const row = LIVE_BATTERY[i];
      const res = await fetch(apiPath("/api/extract"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: row.text }),
      });
      const json = (await res.json()) as Classification & {
        error?: string;
        runtime?: { provider: string; model: string; ms: number };
      };
      if (!res.ok) throw new Error(json.error || `Extract HTTP ${res.status}`);
      provider = json.runtime?.provider ?? provider;
      modelName = json.runtime?.model ?? modelName;
      predCount[json.barrier] = (predCount[json.barrier] ?? 0) + 1;
      const hit = json.barrier === row.gold;
      if (hit) agree += 1;
      const shot: Shot = {
        label: row.label,
        gold: row.gold,
        pred: json.barrier,
        disq: Boolean(json.disqualifiedMonetary),
        ok: hit,
      };
      rows.push(shot);
      setShots([...rows]);
      pushLog(
        t0,
        "extract",
        `${row.label} → ${SHORT[json.barrier]}${json.disqualifiedMonetary ? " DISQ" : ""} ${hit ? "✓" : "≠ " + SHORT[row.gold]}`,
        hit,
      );
      setTick({ i: i + 1, n });
    }

    pushLog(t0, "rank", `Groq vs my labels ${agree}/${n}`);

    return {
      ms: Date.now() - t0,
      n,
      agree,
      agreePct: Math.round((100 * agree) / n),
      promptChars: EXTRACT_PROMPT.length,
      byBarrier: OPPORTUNITIES.map((o) => ({
        id: o.id,
        name: o.name,
        gold: goldCount[o.id],
        pred: predCount[o.id] ?? 0,
      })),
      logs: [],
      provider,
      llmModel: modelName,
      via: "llm",
    };
  }

  async function run() {
    if (running) return;
    setRunning(true);
    setErr(null);
    setLogs([]);
    setDone(null);
    setTick({ i: 0, n: LIVE_BATTERY.length });
    go("try");
    try {
      setModel(buildVecModel());
      if (!engine?.live) {
        throw new Error("No model on this host. Open https://myntra-verdict.vercel.app/discovery/");
      }
      const res = await runLive();
      setDone(res);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Extract failed");
    } finally {
      setRunning(false);
    }
  }

  async function runQuote(text: string) {
    setPaste(text);
    go("try");
    setExtractMeta(null);
    setErr(null);
    if (!engine?.live) {
      setResult(null);
      setErr("Extract is off here. Open the live URL.");
      return;
    }
    setCalling(true);
    try {
      const res = await fetch(apiPath("/api/extract"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Extract HTTP ${res.status}`);
      setResult(json as Classification);
      if (text === FIT.text) setSentFit(true);
      if (json.runtime) setExtractMeta(json.runtime);
    } catch (e) {
      setResult(null);
      setErr(e instanceof Error ? e.message : "Extract failed");
    } finally {
      setCalling(false);
    }
  }

  const connecting = engine === null;
  const live = Boolean(engine?.live);

  return (
    <div className="studio">
      <header className="studio-top">
        <div>
          <p className="hub-kicker">Part 1 · live model{live ? ` · ${engine?.provider}` : ""}</p>
          <h1 className="display sm">Send this review. Groq says why they didn’t buy.</h1>
          <p className="hub-lede" style={{ marginTop: 8, maxWidth: 640 }}>
            This is the AI, not the shop. Press Send. Then send EORS wait — that one must come back DISQUALIFIED. The
            625 / 400 scores below are from quotes I labelled. Groq does not invent how common something is.
          </p>
        </div>
      </header>

      {err ? <p className="callout">{err}</p> : null}

      <div className="studio-grid">
        <section className="viz-card">
          <header>
            <h2>Send</h2>
            <p>Loaded: Fit freeze. One primary button.</p>
          </header>
          <p className="recommended-chip">
            <b>{FIT.label}</b>
            <span>expect {expectFor(FIT.gold)}</span>
          </p>
          <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={6} />
          <div className="path-ctas" style={{ marginTop: 8 }}>
            {connecting ? (
              <button className="primary" type="button" disabled>
                Connecting to Groq…
              </button>
            ) : live ? (
              <button
                className="primary"
                type="button"
                disabled={!paste.trim() || calling || running}
                onClick={() => runQuote(paste)}
              >
                {calling ? "Calling Groq…" : "Send to Groq"}
              </button>
            ) : (
              <a className="primary" href={LINKS.discovery}>
                Open the live URL
              </a>
            )}
            {sentFit && paste !== EORS.text && live ? (
              <button className="secondary" type="button" disabled={calling || running} onClick={() => runQuote(EORS.text)}>
                Send EORS wait
              </button>
            ) : null}
          </div>
          {live ? (
            <p className="muted" style={{ marginTop: 8 }}>
              {engine?.provider}/{engine?.model}
              {extractMeta ? ` · last call ${extractMeta.ms}ms` : ""}
            </p>
          ) : null}
          <details className="more-samples">
            <summary>More samples and check all 7</summary>
            <div className="filters">
              {REST.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  className={`filter ${paste === s.text ? "on" : ""}`}
                  onClick={() => runQuote(s.text)}
                  disabled={calling || running || !live}
                >
                  {s.label}
                  <span className="filter-expect"> → {expectFor(s.gold)}</span>
                </button>
              ))}
            </div>
            <button className="secondary" type="button" onClick={run} disabled={running || calling || !live} style={{ marginTop: 8 }}>
              {running ? `Checking ${tick.i}/${tick.n}` : "Check all 7 vs my labels"}
            </button>
          </details>
        </section>

        <section className={`viz-card output-stage${result ? "" : " empty"}`}>
          <header>
            <h2>Output</h2>
            <p>
              {result
                ? result.disqualifiedMonetary
                  ? "I can’t solve this by paying the user."
                  : `${result.intentGuess} intent · ${result.job}`
                : "Output — Groq’s barrier for this quote lands here. Nothing is sent until you press Send."}
            </p>
          </header>
          {result ? (
            <>
              <p className="result-barrier">{result.opportunityName}</p>
              {result.disqualifiedMonetary ? <p className="disq-chip">DISQUALIFIED</p> : null}
              {goldForPaste ? (
                <p className={result.barrier === goldForPaste.gold ? "result-match ok" : "result-match miss"}>
                  {result.barrier === goldForPaste.gold
                    ? `Matches what I labelled (${expectFor(goldForPaste.gold)}).`
                    : `I labelled this ${expectFor(goldForPaste.gold)}. Groq said ${SHORT[result.barrier]}.`}
                </p>
              ) : (
                <p className="muted">Paste is free-text, so there’s no gold label to check against.</p>
              )}
              <p style={{ marginTop: 12 }}>{result.productCall}</p>
              <details style={{ marginTop: 16 }}>
                <summary>JSON from Groq</summary>
                <pre className="extract-json">{JSON.stringify(result.extract, null, 2)}</pre>
              </details>
            </>
          ) : (
            <div className="output-frame">Nothing is sent until you press Send.</div>
          )}
        </section>

        {shots.length > 0 || running ? (
          <section className="viz-card span2">
            <header>
              <h2>Seven labelled quotes</h2>
              <p>
                {running
                  ? `Live ${tick.i}/${tick.n}.`
                  : done
                    ? `${done.agree}/${done.n} matched my labels (${done.agreePct}%). Ranking scores stay mine.`
                    : "Each row is one POST /api/extract."}
              </p>
            </header>
            {running ? (
              <div className="run-meter">
                <span style={{ width: `${(tick.i / Math.max(tick.n, 1)) * 100}%` }} />
              </div>
            ) : null}
            <table className="table battery-table">
              <thead>
                <tr>
                  <th>Sample</th>
                  <th>I labelled</th>
                  <th>Groq</th>
                  <th>Match</th>
                </tr>
              </thead>
              <tbody>
                {LIVE_BATTERY.map((s) => {
                  const hit = shots.find((x) => x.label === s.label);
                  return (
                    <tr key={s.label} className={hit ? (hit.ok ? "picked" : "disq") : ""}>
                      <td>{s.label}</td>
                      <td>{expectFor(s.gold)}</td>
                      <td>{hit ? `${SHORT[hit.pred]}${hit.disq ? " · DISQ" : ""}` : running ? "…" : "—"}</td>
                      <td>{hit ? (hit.ok ? "Yes" : "No") : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        ) : null}
      </div>

      <details
        className="hub-fold"
        open={panel === "board"}
        onToggle={(e) => go((e.currentTarget as HTMLDetailsElement).open ? "board" : "try")}
      >
        <summary>How I ranked (coded panel, not Groq)</summary>
        <div className="studio-grid" style={{ marginTop: 12 }}>
          <section className="viz-card span2">
            <header>
              <h2>These scores are not the model</h2>
              <p>
                I coded {stats.n} quotes (F × S × M × N). Groq only labels a quote you send.
                {model ? ` ${model.vocabSize} tokens in the overlap check, unused for rank.` : ""} Click a bar to read
                evidence.
              </p>
            </header>
          </section>
          <section className="viz-card">
            <header>
              <h2>Scores</h2>
              <p>Fit 625 picked. Sale 100 shown and refused.</p>
            </header>
            <HBars
              picked={picked}
              onPick={(id) => setPicked(id as BarrierId)}
              rows={OPPORTUNITIES.map((o) => ({
                id: o.id,
                label: o.name,
                value: o.score,
                note: o.disqualifiedMonetary
                  ? "DISQ"
                  : o.id === "fit_uncertainty"
                    ? "PICKED"
                    : o.id === "return_seal_tag_fear"
                      ? "CO-PRIMARY"
                      : `${shareOf(o.id)}%`,
                tone: o.disqualifiedMonetary ? "disq" : o.id === "fit_uncertainty" ? "pick" : undefined,
              }))}
            />
          </section>
          <section className="viz-card">
            <header>
              <h2>What I’m allowed to solve</h2>
              <p>X: blocks buying a saved item in 30 days. Y: can I fix it without paying the user.</p>
            </header>
            <Scatter
              xLabel="← Blocks 30-day conversion of a saved SKU"
              yLabel="Solvable without paying →"
              onPick={(id) => setPicked(id as BarrierId)}
              points={OPPORTUNITIES.map((o) => ({
                id: o.id,
                x: o.m,
                y: o.n,
                r: o.f,
                label: o.name.split(" ")[0],
                tone: o.disqualifiedMonetary ? "disq" : o.id === "fit_uncertainty" ? "pick" : undefined,
              }))}
            />
          </section>
          <section className="viz-card">
            <header>
              <h2>Intent mix</h2>
              <p>Bookmark is a different job. I’m not treating it as demand.</p>
            </header>
            <Stacked
              slices={intent.map((r) => ({
                id: r.key,
                label: r.key,
                pct: r.pct,
                tone: r.key === "genuine" ? "pick" : r.key === "bookmark" ? "mute" : "",
              }))}
            />
            <p className="muted" style={{ marginTop: 12 }}>
              {stats.offPct}% leave the app. {stats.fitPct}% speak fit.
            </p>
          </section>
          <section className="viz-card">
            <header>
              <h2>Sources</h2>
              <p>What the brief asked for, not one Reddit dump.</p>
            </header>
            <HBars
              rows={coverage.map((r) => ({
                id: r.brief,
                label: r.brief,
                value: r.n,
                note: r.sources,
              }))}
            />
          </section>
          <section className="viz-card span2">
            <header>
              <h2>{opp.name}</h2>
              <p>{opp.whyScore}</p>
            </header>
            <div className="filters">
              {sources.map((src) => (
                <button key={src} type="button" className={`filter ${sourceFilter === src ? "on" : ""}`} onClick={() => setSourceFilter(src)}>
                  {src}
                </button>
              ))}
            </div>
            <div className="ev-grid">
              {evidence.slice(0, 6).map((q) => (
                <blockquote key={q.id} className="quote">
                  <p>{q.text}</p>
                  <p className="muted" style={{ marginTop: 6 }}>
                    {q.source} · {q.intent} ·{" "}
                    <a href={q.sourceUrl} target="_blank" rel="noreferrer">
                      source
                    </a>
                  </p>
                </blockquote>
              ))}
            </div>
          </section>
        </div>
      </details>

      <details
        className="hub-fold"
        open={panel === "brief"}
        onToggle={(e) => go((e.currentTarget as HTMLDetailsElement).open ? "brief" : "try")}
      >
        <summary>10 questions</summary>
        <BriefQuestions />
      </details>

      <details
        className="hub-fold"
        open={panel === "method"}
        onToggle={(e) => go((e.currentTarget as HTMLDetailsElement).open ? "method" : "try")}
      >
        <summary>Prompt</summary>
        <div className="tab-body" style={{ marginTop: 12 }}>
          <p>
            Each Send is one Groq call. System prompt is <a href={LINKS.extractPrompt}>extract-prompt.md</a>. If Groq
            says sale-wait or EORS, I force DISQUALIFY.
          </p>
          {logs.length ? <pre className="run-log">{logs.map((l) => `${String(l.at).padStart(4, " ")}ms  ${l.msg}`).join("\n")}</pre> : null}
          <pre className="extract-json">{EXTRACT_PROMPT}</pre>
          <SegmentsPanel />
        </div>
      </details>
    </div>
  );
}
