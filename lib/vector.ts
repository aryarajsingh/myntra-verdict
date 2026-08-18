import { CORPUS } from "@/data/corpus";
import { OPPORTUNITIES } from "@/data/opportunities";
import type { BarrierId, Quote } from "@/data/types";

const STOP = new Set(
  "the and for this that with from have not are was were been they you she her his will just then than into about would could should dont like still even very really also more some only when what which their them there your our can but its it's i i'm ive a an of to in on at by or as if so my me we us it is be do did does no yes out over after before too all any than".split(
    " ",
  ),
);

export type VecModel = {
  dim: number;
  vocabIndex: Map<string, number>;
  idf: Float64Array;
  centroids: Record<BarrierId, Float64Array>;
  nQuotes: number;
  vocabSize: number;
};

export type BarrierSim = { id: BarrierId; name: string; cosine: number };

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^'+|'+$/g, ""))
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function tf(tokens: string[], index: Map<string, number>, dim: number): Float64Array {
  const v = new Float64Array(dim);
  if (!tokens.length) return v;
  for (const t of tokens) {
    const i = index.get(t);
    if (i !== undefined) v[i] += 1;
  }
  for (let i = 0; i < dim; i++) if (v[i]) v[i] /= tokens.length;
  return v;
}

function applyIdf(v: Float64Array, idf: Float64Array) {
  for (let i = 0; i < v.length; i++) v[i] *= idf[i];
  return v;
}

export function cosine(a: Float64Array, b: Float64Array) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function buildVecModel(quotes: Quote[] = CORPUS): VecModel {
  const df = new Map<string, number>();
  const docs = quotes.map((q) => tokenize(q.text));
  for (const tokens of docs) {
    for (const t of new Set(tokens)) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const vocab = [...df.entries()].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]);
  const vocabIndex = new Map(vocab.map((row, i) => [row[0], i]));
  const dim = vocab.length;
  const n = quotes.length;
  const idf = new Float64Array(dim);
  for (let i = 0; i < dim; i++) {
    idf[i] = Math.log((1 + n) / (1 + vocab[i][1])) + 1;
  }

  const sums: Record<string, Float64Array> = {};
  const counts: Record<string, number> = {};
  for (const o of OPPORTUNITIES) {
    sums[o.id] = new Float64Array(dim);
    counts[o.id] = 0;
  }
  quotes.forEach((q, qi) => {
    const v = applyIdf(tf(docs[qi], vocabIndex, dim), idf);
    const s = sums[q.barrier];
    for (let i = 0; i < dim; i++) s[i] += v[i];
    counts[q.barrier] += 1;
  });

  const centroids = {} as Record<BarrierId, Float64Array>;
  for (const o of OPPORTUNITIES) {
    const c = new Float64Array(dim);
    const k = counts[o.id] || 1;
    for (let i = 0; i < dim; i++) c[i] = sums[o.id][i] / k;
    centroids[o.id] = c;
  }

  return { dim, vocabIndex, idf, centroids, nQuotes: n, vocabSize: dim };
}

export function quoteVector(text: string, model: VecModel) {
  return applyIdf(tf(tokenize(text), model.vocabIndex, model.dim), model.idf);
}

export function cosineScores(text: string, model: VecModel): BarrierSim[] {
  const v = quoteVector(text, model);
  return OPPORTUNITIES.map((o) => ({
    id: o.id,
    name: o.name,
    cosine: cosine(v, model.centroids[o.id]),
  })).sort((a, b) => b.cosine - a.cosine);
}
