"use client";

import { type ReactNode, useMemo, useRef, useState } from "react";
import { INTERVIEWS } from "@/data/interviews";
import {
  freezeRows,
  leverRows,
  namesForIds,
  offAppRows,
  peopleForBarrier,
  INTERVIEW_N,
  SURVEY_N,
  type FreezeRow,
} from "@/lib/research";
import type { BarrierId } from "@/data/types";

const INK = "#1c1917";
const SURVEY = "#c21845";
const SALE = "#b45309";
const MUTED = "#a8a29e";
const GRID = "#e7e0d6";

const SLICE: Record<string, string> = {
  fit_uncertainty: INK,
  return_seal_tag_fear: "#d55e00",
  budget_sale_wait: SALE,
  size_chart_distrust: "#0072b2",
  comparison_paralysis: "#56b4e9",
  bookmark_only: "#cc79a7",
  styling_occasion: "#009e73",
};

type Tip = { x: number; y: number; title: string; lines: string[] };

function FloatTip({ tip }: { tip: Tip | null }) {
  if (!tip) return null;
  const left = `${Math.min(Math.max(tip.x, 12), 88)}%`;
  return (
    <div className="chart-tip float" style={{ left, top: tip.y }} role="tooltip">
      <b>{tip.title}</b>
      {tip.lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function useLocalTip() {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);

  function show(e: { clientX: number; clientY: number }, title: string, lines: string[]) {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    setTip({
      x: ((e.clientX - box.left) / box.width) * 100,
      y: e.clientY - box.top,
      title,
      lines,
    });
  }

  return { ref, tip, show, clear: () => setTip(null) };
}

function yTicks(max: number) {
  return [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(t * max));
}

function Card({
  title,
  hint,
  span,
  children,
}: {
  title: string;
  hint: ReactNode;
  span?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`chart-card ${span ? "span2" : ""}`}>
      <header>
        <h2>{title}</h2>
        <p>{hint}</p>
      </header>
      {children}
    </section>
  );
}

function FreezePlot({
  rows,
  barrier,
  onBarrier,
}: {
  rows: FreezeRow[];
  barrier: BarrierId | null;
  onBarrier: (id: BarrierId | null) => void;
}) {
  const { ref, tip, show, clear } = useLocalTip();
  const W = 560;
  const H = 292;
  const pad = { t: 22, r: 8, b: 52, l: 36 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const g = plotW / rows.length;
  const barW = Math.min(20, g / 2.7);
  const gap = 3;
  const pair = barW * 2 + gap;

  function toggle(id: BarrierId) {
    onBarrier(id === barrier ? null : id);
  }

  return (
    <div className="chart-frame" ref={ref} onMouseLeave={clear}>
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Freeze: interviews vs survey">
        <title>Where they froze — interviews vs in-target survey</title>
        {yTicks(100).map((t) => {
          const y = pad.t + plotH - (t / 100) * plotH;
          return (
            <g key={t}>
              <line x1={pad.l} x2={pad.l + plotW} y1={y} y2={y} stroke={GRID} />
              <text x={pad.l - 6} y={y} textAnchor="end" dominantBaseline="middle" className="chart-tick">
                {t}%
              </text>
            </g>
          );
        })}
        {rows.map((row, i) => {
          const x0 = pad.l + i * g + (g - pair) / 2;
          const hI = Math.max(row.interviewsPct > 0 ? 3 : 0, (row.interviewsPct / 100) * plotH);
          const hS = Math.max(row.surveyPct > 0 ? 3 : 0, (row.surveyPct / 100) * plotH);
          const yI = pad.t + plotH - hI;
          const yS = pad.t + plotH - hS;
          const on = !barrier || barrier === row.id;
          const names = namesForIds(peopleForBarrier(row.id));
          const lines = [
            `Interviews: ${row.interviews} / ${INTERVIEW_N} (${row.interviewsPct}%)`,
            `Survey: ${row.survey} / ${SURVEY_N} (${row.surveyPct}%)`,
            names ? `Rooms: ${names}` : "No interview coded here",
            ...(row.disq ? ["DISQUALIFIED — I can’t pay for this conversion."] : []),
          ];
          const cx = x0 + pair / 2;
          const lines2 = row.label.includes(" / ") ? row.label.split(" / ") : [row.label];
          return (
            <g key={row.id} opacity={on ? 1 : 0.28}>
              <rect
                className="chart-grow"
                x={x0}
                y={yI}
                width={barW}
                height={hI}
                rx={3}
                fill={row.disq ? MUTED : INK}
                tabIndex={0}
                role="button"
                aria-pressed={barrier === row.id}
                aria-label={`${row.label} interviews ${row.interviewsPct} percent`}
                style={{ cursor: "pointer" }}
                onClick={() => toggle(row.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(row.id);
                  }
                }}
                onMouseMove={(e) => show(e, row.label, lines)}
              />
              <rect
                className="chart-grow"
                x={x0 + barW + gap}
                y={yS}
                width={barW}
                height={hS}
                rx={3}
                fill={row.disq ? SALE : SURVEY}
                tabIndex={0}
                role="button"
                aria-pressed={barrier === row.id}
                aria-label={`${row.label} survey ${row.surveyPct} percent`}
                style={{ cursor: "pointer" }}
                onClick={() => toggle(row.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(row.id);
                  }
                }}
                onMouseMove={(e) => show(e, row.label, lines)}
              />
              {row.surveyPct >= 12 ? (
                <text x={x0 + barW + gap + barW / 2} y={yS - 5} textAnchor="middle" className="chart-val">
                  {row.surveyPct}
                </text>
              ) : null}
              {lines2.map((line, li) => (
                <text
                  key={line}
                  x={cx}
                  y={pad.t + plotH + 14 + li * 12}
                  textAnchor="middle"
                  className="chart-xlabel"
                >
                  {line}
                </text>
              ))}
            </g>
          );
        })}
        <line x1={pad.l} x2={pad.l + plotW} y1={pad.t + plotH} y2={pad.t + plotH} stroke={INK} strokeWidth={1.2} />
      </svg>
      <FloatTip tip={tip} />
    </div>
  );
}

function polar(cx: number, cy: number, r: number, a: number) {
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

function slicePath(cx: number, cy: number, r: number, r0: number, a0: number, a1: number) {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const [ix0, iy0] = polar(cx, cy, r0, a1);
  const [ix1, iy1] = polar(cx, cy, r0, a0);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${ix0} ${iy0} A ${r0} ${r0} 0 ${large} 0 ${ix1} ${iy1} Z`;
}

function MixDonut({
  rows,
  barrier,
  onBarrier,
}: {
  rows: FreezeRow[];
  barrier: BarrierId | null;
  onBarrier: (id: BarrierId | null) => void;
}) {
  const { ref, tip, show, clear } = useLocalTip();
  const total = rows.reduce((s, r) => s + r.survey, 0) || 1;
  const cx = 118;
  const cy = 118;
  const r = 96;
  const r0 = 58;
  let a = -Math.PI / 2;
  const slices = rows.map((row) => {
    const span = (row.survey / total) * Math.PI * 2;
    const a0 = a;
    const a1 = a + span;
    a = a1;
    return { ...row, a0, a1 };
  });

  return (
    <div className="donut-wrap" ref={ref} onMouseLeave={clear}>
      <svg className="chart-svg donut-svg" viewBox="0 0 236 236" role="img" aria-label="Survey freeze mix">
        <title>Survey freeze mix, in-target n={SURVEY_N}</title>
        {slices.map((s) => (
          <path
            key={s.id}
            d={slicePath(cx, cy, r, r0, s.a0, s.a1)}
            fill={SLICE[s.id] ?? MUTED}
            opacity={!barrier || barrier === s.id ? 1 : 0.22}
            style={{ cursor: "pointer" }}
            role="button"
            tabIndex={0}
            aria-label={`${s.label} ${s.survey} of ${SURVEY_N}`}
            onClick={() => onBarrier(s.id === barrier ? null : s.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onBarrier(s.id === barrier ? null : s.id);
              }
            }}
            onMouseMove={(e) =>
              show(e, s.label, [
                `${s.survey} of ${SURVEY_N} (${s.surveyPct}%)`,
                s.disq ? "DISQUALIFIED" : `Interviews: ${namesForIds(peopleForBarrier(s.id)) || "—"}`,
              ])
            }
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" className="donut-n">
          {SURVEY_N}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" className="donut-sub">
          in-target
        </text>
      </svg>
      <ul className="donut-legend">
        {slices.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              aria-pressed={barrier === s.id}
              onClick={() => onBarrier(s.id === barrier ? null : s.id)}
              style={{ opacity: !barrier || barrier === s.id ? 1 : 0.4 }}
            >
              <i style={{ background: SLICE[s.id] ?? MUTED }} />
              <span>
                {s.label}
                {s.disq ? " · DISQ" : ""}
              </span>
              <b>
                {s.survey} · {s.surveyPct}%
              </b>
            </button>
          </li>
        ))}
      </ul>
      <FloatTip tip={tip} />
    </div>
  );
}

function LeverPlot() {
  const { ref, tip, show, clear } = useLocalTip();
  const rows = useMemo(() => leverRows(), []);
  const W = 720;
  const rowH = 48;
  const pad = { t: 8, r: 56, b: 28, l: 132 };
  const H = pad.t + pad.b + rows.length * rowH;
  const plotW = W - pad.l - pad.r;

  return (
    <div className="chart-frame" ref={ref} onMouseLeave={clear}>
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Survey checks">
        <title>Survey checks among in-target respondents</title>
        {yTicks(100).map((t) => {
          const x = pad.l + (t / 100) * plotW;
          return (
            <g key={t}>
              <line x1={x} x2={x} y1={pad.t} y2={H - pad.b} stroke={GRID} />
              <text x={x} y={H - 8} textAnchor="middle" className="chart-tick">
                {t}%
              </text>
            </g>
          );
        })}
        {rows.map((row, i) => {
          const y = pad.t + i * rowH + rowH / 2;
          const x = pad.l + (row.pct / 100) * plotW;
          const fill = row.disq ? MUTED : SURVEY;
          return (
            <g
              key={row.id}
              onMouseMove={(e) =>
                show(e, row.label, [
                  `${row.n} of ${row.of} (${row.pct}%)`,
                  ...(row.disq ? ["Coupon-only. Not a lever I can ship."] : []),
                ])
              }
            >
              <text x={pad.l - 12} y={y} textAnchor="end" dominantBaseline="middle" className="chart-xlabel">
                {row.short}
              </text>
              <line x1={pad.l} x2={x} y1={y} y2={y} stroke={fill} strokeWidth={3} className="chart-grow-x" />
              <circle cx={x} cy={y} r={7} fill={fill} />
              <text x={x + 12} y={y} dominantBaseline="middle" className="chart-val">
                {row.n}/{row.of}
              </text>
            </g>
          );
        })}
      </svg>
      <FloatTip tip={tip} />
    </div>
  );
}

function OffPlot({
  offFilter,
  onOffFilter,
}: {
  offFilter: string | null;
  onOffFilter: (id: string | null) => void;
}) {
  const { ref, tip, show, clear } = useLocalTip();
  const rows = useMemo(() => offAppRows(), []);
  const W = 720;
  const rowH = 42;
  const pad = { t: 8, r: 28, b: 28, l: 168 };
  const H = pad.t + pad.b + rows.length * rowH;
  const plotW = W - pad.l - pad.r;
  const max = INTERVIEW_N;

  return (
    <div className="chart-frame" ref={ref} onMouseLeave={clear}>
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Where the decision happens">
        <title>Off-app places coded from the six rooms</title>
        {Array.from({ length: max + 1 }, (_, t) => t).map((t) => {
          const x = pad.l + (t / max) * plotW;
          return (
            <g key={t}>
              <line x1={x} x2={x} y1={pad.t} y2={H - pad.b} stroke={GRID} />
              <text x={x} y={H - 8} textAnchor="middle" className="chart-tick">
                {t}
              </text>
            </g>
          );
        })}
        {rows.map((row, i) => {
          const y = pad.t + i * rowH + rowH / 2;
          const x = pad.l + (row.n / max) * plotW;
          const on = !offFilter || offFilter === row.id;
          const names = namesForIds(row.people);
          return (
            <g
              key={row.id}
              opacity={on ? 1 : 0.28}
              style={{ cursor: "pointer" }}
              role="button"
              tabIndex={0}
              aria-pressed={offFilter === row.id}
              onClick={() => onOffFilter(offFilter === row.id ? null : row.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOffFilter(offFilter === row.id ? null : row.id);
                }
              }}
              onMouseMove={(e) => show(e, row.label, [`${row.n} of ${INTERVIEW_N}: ${names}`])}
            >
              <text x={pad.l - 12} y={y} textAnchor="end" dominantBaseline="middle" className="chart-xlabel">
                {row.label}
              </text>
              <line x1={pad.l} x2={x} y1={y} y2={y} stroke={INK} strokeWidth={3} className="chart-grow-x" />
              <circle cx={x} cy={y} r={7} fill={INK} />
              {row.people.map((id, pi) => {
                const p = INTERVIEWS.find((x) => x.id === id);
                const px = x + 18 + pi * 22;
                return (
                  <g key={id}>
                    <circle cx={px} cy={y} r={9} fill="#f4efe8" stroke={INK} />
                    <text x={px} y={y + 1} textAnchor="middle" dominantBaseline="middle" className="chart-initial">
                      {p?.name[0]}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <FloatTip tip={tip} />
    </div>
  );
}

export function ResearchCharts({
  barrier,
  onBarrier,
  offFilter,
  onOffFilter,
}: {
  barrier: BarrierId | null;
  onBarrier: (id: BarrierId | null) => void;
  offFilter: string | null;
  onOffFilter: (id: string | null) => void;
}) {
  const freeze = useMemo(() => freezeRows(), []);

  return (
    <div className="research-dash">
      <Card
        title="Where they froze"
        hint={
          <>
            % of interviews (n={INTERVIEW_N}) vs % of in-target survey (n={SURVEY_N}). Click a bar to open those rooms.
            {barrier ? (
              <>
                {" "}
                <button type="button" className="text-btn" onClick={() => onBarrier(null)}>
                  Clear
                </button>
              </>
            ) : null}
          </>
        }
      >
        <FreezePlot rows={freeze} barrier={barrier} onBarrier={onBarrier} />
        <ul className="chart-legend">
          <li>
            <i style={{ background: INK }} />
            Interviews
          </li>
          <li>
            <i style={{ background: SURVEY }} />
            Survey
          </li>
          <li>
            <i style={{ background: SALE }} />
            Sale wait (DISQ)
          </li>
        </ul>
      </Card>

      <Card
        title="Survey mix"
        hint="Q3 primary freeze among in-target women 24–32. Same click as the bars."
      >
        <MixDonut rows={freeze} barrier={barrier} onBarrier={onBarrier} />
      </Card>

      <Card title="Survey checks" hint={`In-target n=${SURVEY_N}. Hover for the question.`} span>
        <LeverPlot />
      </Card>

      <Card
        title="Where the decision actually happens"
        hint={
          <>
            Coded from the six rooms. Click a row to highlight those people.
            {offFilter ? (
              <>
                {" "}
                <button type="button" className="text-btn" onClick={() => onOffFilter(null)}>
                  Clear
                </button>
              </>
            ) : null}
          </>
        }
        span
      >
        <OffPlot offFilter={offFilter} onOffFilter={onOffFilter} />
      </Card>
    </div>
  );
}
