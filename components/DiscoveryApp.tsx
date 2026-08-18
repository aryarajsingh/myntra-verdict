"use client";

import { useEffect, useMemo, useState } from "react";
import { CORPUS, quotesFor } from "@/data/corpus";
import { OPPORTUNITIES } from "@/data/opportunities";
import { BriefQuestions, SegmentsPanel } from "@/components/BriefQuestions";
import { Modal } from "@/components/Modal";
import { HBars, Scatter, Stacked } from "@/components/Viz";
import { SAMPLE_QUOTES, type Classification } from "@/lib/classify";
import { EXTRACT_PROMPT } from "@/data/extract-prompt";
import { LINKS } from "@/lib/links";
import { apiPath } from "@/lib/api";
import { LIVE_BATTERY } from "@/lib/live-battery";
import type { PipeLog, PipeResult, PipeStage } from "@/lib/pipeline";
import { corpusStats, mixOf, shareOf, sourceCoverage } from "@/lib/stats";
import { buildVecModel, type VecModel } from "@/lib/vector";
import type { BarrierId } from "@/data/types";
import { useTour } from "@/components/LayoutTour";

const NODES: { id: PipeStage; t: string; d: string }[] = [
  { id: "ingest", t: "Ingest", d: "Load the extract schema. Quotes are already coded for scoring." },
  { id: "vector", t: "Vector", d: "Token overlap on the coded set. Similarity only — not the rank." },
  { id: "extract", t: "Extract", d: "Groq returns JSON for each sample quote. Same schema as extract-prompt.md." },
  { id: "score", t: "Score", d: "F × S × M × N from the coded panel. The model does not invent frequency." },
  { id: "policy", t: "Policy", d: "If the only fix is paying the user, N=1. DISQUALIFY." },
  { id: "rank", t: "Rank", d: "Highest legal score: fit, then return/seal-tag. Sale is shown and dropped." },
];

type Panel = "board" | "try" | "brief" | "method";

export function DiscoveryApp() {
  const tour = useTour();
  const stats = corpusStats();
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<PipeStage | null>(null);
  const [done, setDone] = useState<PipeResult | null>(null);
  const [logs, setLogs] = useState<PipeLog[]>([]);
  const [tick, setTick] = useState({ i: 0, n: LIVE_BATTERY.length });
  const [model, setModel] = useState<VecModel | null>(null);
  const [picked, setPicked] = useState<BarrierId>("fit_uncertainty");
  const [panel, setPanel] = useState<Panel>("board");
  const [node, setNode] = useState<PipeStage | null>(null);
  const [paste, setPaste] = useState(SAMPLE_QUOTES[0].text);
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
    setStage("ingest");
    pushLog(t0, "ingest", `POST /api/extract × ${n} sample quotes`);
    pushLog(t0, "ingest", `extract prompt ${EXTRACT_PROMPT.length} chars`, true);
    pushLog(t0, "ingest", `${CORPUS.length} quotes already coded for F×S×M×N`, true);

    setStage("vector");
    pushLog(t0, "vector", "TF–IDF stays on the coded set — scores are not model votes");

    setStage("extract");
    pushLog(t0, "extract", `Groq, n=${n}`);

    const predCount: Record<string, number> = {};
    const goldCount: Record<string, number> = {};
    for (const o of OPPORTUNITIES) {
      predCount[o.id] = 0;
      goldCount[o.id] = CORPUS.filter((q) => q.barrier === o.id).length;
    }

    let agree = 0;
    let provider = "none";
    let modelName = "unset";

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
      pushLog(
        t0,
        "extract",
        `${provider}/${modelName} ${json.runtime?.ms ?? "?"}ms  ${row.label} → ${json.barrier}${
          json.disqualifiedMonetary ? " DISQ" : ""
        } ${hit ? "✓" : "≠ " + row.gold}`,
        hit,
      );
      setTick({ i: i + 1, n });
    }

    setStage("score");
    for (const o of OPPORTUNITIES.slice(0, 4)) {
      pushLog(t0, "score", `${o.name}  ${o.f}×${o.s}×${o.m}×${o.n} = ${o.score}${o.disqualifiedMonetary ? " · N=1" : ""}`);
    }

    setStage("policy");
    pushLog(t0, "policy", "DISQUALIFY budget_sale_wait — I can’t pay for conversion", true);

    setStage("rank");
    pushLog(t0, "rank", `${OPPORTUNITIES[0].name} ${OPPORTUNITIES[0].score} + ${OPPORTUNITIES[1].name} ${OPPORTUNITIES[1].score}`, true);
    pushLog(t0, "rank", `model vs my labels ${agree}/${n} (${Math.round((100 * agree) / n)}%)`);

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
    try {
      setModel(buildVecModel());
      if (!engine?.live) {
        throw new Error("No model on this host. This page needs the Vercel deploy with GROQ_API_KEY.");
      }
      const res = await runLive();
      setDone(res);
      setStage("rank");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Pipeline failed");
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
      setErr("Extract is off here. Use the Vercel URL.");
      return;
    }
    try {
      const res = await fetch(apiPath("/api/extract"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Extract HTTP ${res.status}`);
      setResult(json as Classification);
      if (json.runtime) setExtractMeta(json.runtime);
    } catch (e) {
      setResult(null);
      setErr(e instanceof Error ? e.message : "Extract failed");
    }
  }

  return (
    <div className="studio">
      <header className="studio-top">
        <div>
          <p className="hub-kicker">
            WhyWait
            {engine == null
              ? ""
              : engine.live
                ? ` · ${engine.provider}/${engine.model}`
                : " · model not connected"}
          </p>
          <h1 className="display sm">Public quotes in. Ranked barriers out.</h1>
        </div>
        <div className="studio-actions">
          <button className="primary" type="button" onClick={run} disabled={running || engine == null}>
            {running ? `Extract ${tick.i}/${tick.n}` : done?.via === "llm" ? "Run again" : "Run extracts"}
          </button>
          <button className="secondary" type="button" onClick={() => go("try")}>
            Test the model
          </button>
          <button className="ghost" type="button" onClick={tour.open}>
            What’s here
          </button>
          <a className="secondary" href={LINKS.github} target="_blank" rel="noreferrer">
            Code
          </a>
        </div>
      </header>

      <div className="pipe-graph" role="list">
        {NODES.map((n, i) => (
          <button
            key={n.id}
            type="button"
            className={`pipe-node ${stage === n.id ? "now" : done && NODES.findIndex((x) => x.id === stage) >= i ? "done" : ""}`}
            onClick={() => setNode(n.id)}
          >
            <span>0{i + 1}</span>
            <b>{n.t}</b>
            {i < NODES.length - 1 ? <i /> : null}
          </button>
        ))}
      </div>

      {running ? (
        <div className="run-meter">
          <span style={{ width: `${(tick.i / tick.n) * 100}%` }} />
        </div>
      ) : null}

      <div className="studio-kpis">
        <div>
          <span>Live extracts</span>
          <b>{running ? tick.i : done?.n ?? "—"}</b>
        </div>
        <div>
          <span>Vocab</span>
          <b>{model?.vocabSize ?? "—"}</b>
        </div>
        <div>
          <span>LLM ≡ gold</span>
          <b>{done ? `${done.agreePct}%` : "—"}</b>
        </div>
        <div>
          <span>Runtime</span>
          <b>{done ? `${done.ms}ms` : running ? "live" : "idle"}</b>
        </div>
        <div>
          <span>Fit score</span>
          <b>625</b>
        </div>
        <div>
          <span>Sale</span>
          <b>DISQ</b>
        </div>
      </div>

      {err ? <p className="callout">{err}</p> : null}

      <div className="studio-tabs">
        {(
          [
            ["board", "Scores"],
            ["try", "Test the model"],
            ["brief", "10 questions"],
            ["method", "How it works"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" className={panel === id ? "on" : ""} onClick={() => go(id)}>
            {label}
          </button>
        ))}
      </div>

      {panel === "board" ? (
        <div className="studio-grid">
          <section className="viz-card">
            <header>
              <h2>Scores</h2>
              <p>F × S × M × N. Click a row.</p>
            </header>
            <HBars
              picked={picked}
              onPick={(id) => setPicked(id as BarrierId)}
              rows={OPPORTUNITIES.map((o) => ({
                id: o.id,
                label: o.name,
                value: o.score,
                note: o.disqualifiedMonetary ? "DISQ" : o.id === "fit_uncertainty" ? "PICKED" : o.id === "return_seal_tag_fear" ? "CO-PRIMARY" : `${shareOf(o.id)}%`,
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
              <p>
                {opp.whyScore}{" "}
                {done
                  ? done.via === "llm"
                    ? `This sample set vs my labels: pred ${done.byBarrier.find((b) => b.id === picked)?.pred ?? 0}. Coded n=${done.byBarrier.find((b) => b.id === picked)?.gold ?? 0}.`
                    : `Predicted ${done.byBarrier.find((b) => b.id === picked)?.pred ?? 0} vs my labels ${done.byBarrier.find((b) => b.id === picked)?.gold ?? 0}.`
                  : "Run extracts to see Groq on the sample quotes."}
              </p>
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

          <section className="viz-card log-card">
            <header>
              <h2>Runtime log</h2>
              <p>{done?.github ? `${done.github.full_name} · ${done.github.language}` : done?.via === "llm" ? `${done.provider}/${done.llmModel} · POST /api/extract` : "idle"}</p>
            </header>
            <pre className="run-log">
              {logs.length === 0
                ? "Idle. Run extracts — each sample quote hits POST /api/extract. Sale-wait should DISQUALIFY."
                : logs.map((l) => `${String(l.at).padStart(4, " ")}ms  [${l.stage}]  ${l.msg}`).join("\n")}
            </pre>
          </section>
        </div>
      ) : null}

      {panel === "try" ? (
        <div className="studio-grid">
          <section className="viz-card">
            <header>
              <h2>Test the model</h2>
              <p>
                Not a shopper screen. Pick a sample review (or paste one). Groq returns why they didn’t buy the saved
                item. EORS should be sale-wait / DISQUALIFIED. Fit freeze should be fit.
                {extractMeta ? ` Last call: ${extractMeta.provider}/${extractMeta.model}, ${extractMeta.ms}ms.` : ""}
              </p>
            </header>
            <div className="filters">
              {SAMPLE_QUOTES.map((s) => (
                <button key={s.label} type="button" className="filter" onClick={() => runQuote(s.text)}>
                  {s.label}
                </button>
              ))}
            </div>
            <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={6} />
            <button className="primary" type="button" style={{ marginTop: 8, maxWidth: 280 }} disabled={!paste.trim() || !engine?.live} onClick={() => runQuote(paste)}>
              Send to Groq
            </button>
            {!engine?.live ? (
              <p className="muted" style={{ marginTop: 8 }}>
                Extract is off here. Open the Vercel URL.
              </p>
            ) : null}
          </section>
          <section className="viz-card">
            {result ? (
              <>
                <header>
                  <h2>{result.opportunityName}</h2>
                  <p>
                    {result.disqualifiedMonetary
                      ? "DISQUALIFIED — I can’t solve this by paying the user."
                      : `${result.intentGuess} intent · ${result.job}`}
                  </p>
                </header>
                <p>{result.productCall}</p>
                <details style={{ marginTop: 16 }}>
                  <summary>JSON Groq returned</summary>
                  <pre className="extract-json">{JSON.stringify(result.extract, null, 2)}</pre>
                </details>
              </>
            ) : (
              <>
                <header>
                  <h2>No result yet</h2>
                  <p>Start with Fit freeze or EORS wait.</p>
                </header>
              </>
            )}
          </section>
        </div>
      ) : null}

      {panel === "brief" ? <BriefQuestions /> : null}

      {panel === "method" ? (
        <div className="tab-body" style={{ marginTop: 12 }}>
          <p>
            Groq gets <code>extract-prompt.md</code> as the system prompt and returns JSON. If the barrier is
            sale-wait, I force DISQUALIFY even if the model hedges. F×S×M×N stays on the quotes I coded — the model
            doesn’t get to invent how common something is.
          </p>
          <p style={{ marginTop: 12 }}>
            Prompt: <a href={LINKS.extractPrompt}>extract-prompt.md</a>
            {" · "}
            Code:{" "}
            <a href={LINKS.github} target="_blank" rel="noreferrer">
              {LINKS.github.replace("https://", "")}
            </a>
            {engine?.live ? ` · ${engine.provider}/${engine.model}` : " · no model on this host"}
          </p>
          <pre className="extract-json">{EXTRACT_PROMPT}</pre>
          <SegmentsPanel />
        </div>
      ) : null}

      {node ? (
        <Modal kicker="Pipeline node" title={NODES.find((n) => n.id === node)!.t} onClose={() => setNode(null)}>
          <p>{NODES.find((n) => n.id === node)!.d}</p>
          <p className="muted" style={{ marginTop: 12 }}>
            Run extracts: ingest → vector → Groq → score → policy → rank.
          </p>
        </Modal>
      ) : null}
    </div>
  );
}
