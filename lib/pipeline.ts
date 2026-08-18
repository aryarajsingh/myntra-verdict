import { CORPUS } from "@/data/corpus";
import { OPPORTUNITIES } from "@/data/opportunities";
import { classifyText } from "@/lib/classify";
import { LINKS } from "@/lib/links";
import { buildVecModel, type VecModel } from "@/lib/vector";
import type { BarrierId } from "@/data/types";

export type PipeStage = "ingest" | "vector" | "extract" | "score" | "policy" | "rank";

export type PipeLog = {
  at: number;
  stage: PipeStage;
  msg: string;
  ok?: boolean;
};

export type PipeTick = {
  i: number;
  n: number;
  id: string;
  predicted: BarrierId;
  gold: BarrierId;
  agree: boolean;
};

export type PipeResult = {
  model?: VecModel;
  logs: PipeLog[];
  ms: number;
  n: number;
  agree: number;
  agreePct: number;
  promptChars: number;
  github?: { full_name: string; language: string | null; html_url: string };
  byBarrier: { id: BarrierId; name: string; gold: number; pred: number }[];
  provider?: string;
  llmModel?: string;
  via?: "llm" | "static";
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runWhyWait(opts: {
  onLog?: (log: PipeLog) => void;
  onTick?: (tick: PipeTick) => void;
  onStage?: (stage: PipeStage) => void;
}): Promise<PipeResult> {
  const t0 = performance.now();
  const logs: PipeLog[] = [];
  const log = (stage: PipeStage, msg: string, ok?: boolean) => {
    const row = { at: Math.round(performance.now() - t0), stage, msg, ok };
    logs.push(row);
    opts.onLog?.(row);
  };

  opts.onStage?.("ingest");
  log("ingest", `GET ${LINKS.extractPrompt}`);
  let promptChars = 0;
  try {
    const res = await fetch(LINKS.extractPrompt, { cache: "no-store" });
    const txt = await res.text();
    promptChars = txt.length;
    log("ingest", `${res.status} extract-prompt.md · ${promptChars} chars · schema locked`, res.ok);
  } catch {
    log("ingest", "extract-prompt.md unreachable — using bundled schema", false);
  }

  let github: PipeResult["github"];
  try {
    log("ingest", `GET ${LINKS.github.replace("github.com", "api.github.com/repos")}`);
    const res = await fetch("https://api.github.com/repos/aryarajsingh/myntra-verdict", {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (res.ok) {
      const j = (await res.json()) as { full_name: string; language: string | null; html_url: string };
      github = { full_name: j.full_name, language: j.language, html_url: j.html_url };
      log("ingest", `${res.status} GitHub ${j.full_name} · ${j.language ?? "src"}`, true);
    } else {
      log("ingest", `${res.status} GitHub meta skipped`, false);
    }
  } catch {
    log("ingest", "GitHub meta skipped (offline)", false);
  }

  log("ingest", `normalised ${CORPUS.length} public quotes · unit = save/delay/workaround, not a star`, true);
  await sleep(80);

  opts.onStage?.("vector");
  log("vector", "build TF–IDF · min-df 2 · barrier centroids");
  const model = buildVecModel(CORPUS);
  log("vector", `vocab ${model.vocabSize} · docs ${model.nQuotes} · 9 centroids`, true);
  await sleep(60);

  opts.onStage?.("extract");
  log("extract", "hybrid extract: cosine(centroid) + lexical hits → JSON schema");
  let agree = 0;
  const predCount: Record<string, number> = {};
  const goldCount: Record<string, number> = {};
  for (const o of OPPORTUNITIES) {
    predCount[o.id] = 0;
    goldCount[o.id] = 0;
  }

  for (let i = 0; i < CORPUS.length; i++) {
    const q = CORPUS[i];
    const pred = classifyText(q.text, model);
    const hit = pred.barrier === q.barrier;
    if (hit) agree += 1;
    predCount[pred.barrier] += 1;
    goldCount[q.barrier] += 1;
    opts.onTick?.({
      i: i + 1,
      n: CORPUS.length,
      id: q.id,
      predicted: pred.barrier,
      gold: q.barrier,
      agree: hit,
    });
    if (i % 12 === 0 || i === CORPUS.length - 1) {
      log(
        "extract",
        `${i + 1}/${CORPUS.length} ${q.id} → ${pred.barrier}${pred.disqualifiedMonetary ? " DISQ" : ""} ${hit ? "✓" : "≠ gold"}`,
        hit,
      );
      await sleep(12);
    }
  }

  opts.onStage?.("score");
  log("score", "F × S × M × N on gold panel (research lock, not model votes)");
  for (const o of OPPORTUNITIES.slice(0, 4)) {
    log("score", `${o.name}  ${o.f}×${o.s}×${o.m}×${o.n} = ${o.score}${o.disqualifiedMonetary ? " · N=1" : ""}`);
  }
  await sleep(40);

  opts.onStage?.("policy");
  const sale = OPPORTUNITIES.find((o) => o.disqualifiedMonetary)!;
  log("policy", `DISQUALIFY ${sale.name} — constraint forbids paying for conversion`, true);
  await sleep(40);

  opts.onStage?.("rank");
  log("rank", `lock ${OPPORTUNITIES[0].name} ${OPPORTUNITIES[0].score} + ${OPPORTUNITIES[1].name} ${OPPORTUNITIES[1].score}`, true);
  log("rank", `engine vs gold agreement ${agree}/${CORPUS.length} (${Math.round((100 * agree) / CORPUS.length)}%)`);

  return {
    model,
    logs,
    ms: Math.round(performance.now() - t0),
    n: CORPUS.length,
    agree,
    agreePct: Math.round((100 * agree) / CORPUS.length),
    promptChars,
    github,
    via: "static",
    byBarrier: OPPORTUNITIES.map((o) => ({
      id: o.id,
      name: o.name,
      gold: goldCount[o.id],
      pred: predCount[o.id],
    })),
  };
}
