"use client";

export type BarRow = {
  id: string;
  label: string;
  value: number;
  max?: number;
  note?: string;
  tone?: "pick" | "disq" | "mute";
};

export function HBars({
  rows,
  unit,
  onPick,
  picked,
}: {
  rows: BarRow[];
  unit?: string;
  onPick?: (id: string) => void;
  picked?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.max ?? r.value));
  return (
    <div className="hbars">
      {rows.map((r) => (
        <button
          key={r.id}
          type="button"
          className={`hbar ${r.tone ?? ""} ${picked === r.id ? "on" : ""}`}
          onClick={() => onPick?.(r.id)}
        >
          <span className="hbar-l">
            <b>{r.label}</b>
            {r.note ? <i>{r.note}</i> : null}
          </span>
          <span className="hbar-track">
            <span style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="hbar-v">
            {r.value}
            {unit ?? ""}
          </span>
        </button>
      ))}
    </div>
  );
}

export function Scatter({
  points,
  xLabel,
  yLabel,
  onPick,
}: {
  points: { id: string; x: number; y: number; r: number; label: string; tone?: "pick" | "disq" }[];
  xLabel: string;
  yLabel: string;
  onPick?: (id: string) => void;
}) {
  const counts = new Map<string, number>();
  const slots = new Map<string, number>();
  for (const p of points) {
    const key = `${p.x}:${p.y}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return (
    <div className="scatter">
      <span className="sc-y">{yLabel}</span>
      <div className="sc-plot">
        {points.map((p) => {
          const key = `${p.x}:${p.y}`;
          const n = counts.get(key) ?? 1;
          const i = slots.get(key) ?? 0;
          slots.set(key, i + 1);
          const dx = n > 1 ? (i - (n - 1) / 2) * 7 : 0;
          const dy = n > 1 ? (i % 2 === 0 ? 5 : -5) : 0;
          return (
            <button
              key={p.id}
              type="button"
              className={`sc-dot ${p.tone ?? ""}`}
              style={{
                left: `${((p.x - 1) / 4) * 86 + 6 + dx}%`,
                bottom: `${((p.y - 1) / 4) * 78 + 10 + dy}%`,
                width: 10 + p.r * 4,
                height: 10 + p.r * 4,
              }}
              onClick={() => onPick?.(p.id)}
              title={p.label}
            >
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
      <span className="sc-x">{xLabel}</span>
    </div>
  );
}

export function Radar({ axes }: { axes: { key: string; v: number }[] }) {
  const n = axes.length;
  const cx = 80;
  const cy = 80;
  const R = 58;
  const pts = axes.map((a, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const r = (Math.max(0, Math.min(5, a.v)) / 5) * R;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  });
  const ring = (s: number) =>
    axes
      .map((_, i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return `${cx + s * R * Math.cos(ang)},${cy + s * R * Math.sin(ang)}`;
      })
      .join(" ");
  return (
    <svg className="radar" viewBox="0 0 160 168" aria-hidden="true">
      {[0.2, 0.4, 0.6, 0.8, 1].map((s) => (
        <polygon key={s} points={ring(s)} className="radar-ring" />
      ))}
      <polygon points={pts.map((p) => p.join(",")).join(" ")} className="radar-fill" />
      {axes.map((a, i) => {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const x = cx + (R + 16) * Math.cos(ang);
        const y = cy + (R + 16) * Math.sin(ang);
        return (
          <text key={a.key} x={x} y={y} textAnchor="middle" dominantBaseline="middle">
            {a.key} {a.v}
          </text>
        );
      })}
    </svg>
  );
}

export function Funnel({ steps }: { steps: { id: string; label: string; on?: boolean }[] }) {
  return (
    <ol className="funnel">
      {steps.map((s, i) => (
        <li key={s.id} className={s.on ? "on" : ""}>
          <span>{s.id}</span>
          <b>{s.label}</b>
          {i < steps.length - 1 ? <i /> : null}
        </li>
      ))}
    </ol>
  );
}

export function Stacked({ slices }: { slices: { id: string; label: string; pct: number; tone?: string }[] }) {
  return (
    <div className="stacked">
      <div className="stacked-bar">
        {slices.map((s) => (
          <span key={s.id} className={s.tone} style={{ width: `${s.pct}%` }} title={`${s.label} ${s.pct}%`} />
        ))}
      </div>
      <ul>
        {slices.map((s) => (
          <li key={s.id}>
            <i className={s.tone} />
            {s.label} {s.pct}%
          </li>
        ))}
      </ul>
    </div>
  );
}
