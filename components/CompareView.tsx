"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { productById, PRODUCTS } from "@/data/products";
import { PolicyChip, StatusChip } from "./StatusChip";
import { DEFAULT_STATE, effectiveBucket, loadState } from "@/lib/state";
import { useEffect, useState } from "react";
import type { AppState } from "@/lib/state";

export function CompareView() {
  const { id } = useParams<{ id: string }>();
  const origin = productById(id);
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  useEffect(() => setState(loadState()), []);
  if (!origin) return <div className="app-shell pad">Loading…</div>;
  const cols = [origin, ...origin.substitutes.map((s) => PRODUCTS.find((p) => p.id === s)!).filter(Boolean)].slice(0, 3);

  return (
    <div className="app-shell">
      <header className="header">
        <Link href={`/item/${origin.id}`} className="icon-btn" aria-label="Back">
          ←
        </Link>
        <h1>Compare on fit & occasion</h1>
        <span className="icon-btn" />
      </header>
      <div className="pad">
        <p>Same job, different risk. Prices are listed as facts — we are not ranking deals.</p>
        <div className="compare" style={{ marginTop: 16 }}>
          {cols.map((p, i) => (
            <div key={p.id} className="col">
              {i === 0 ? <p className="chip chip-policy">THIS ONE</p> : null}
              <img src={p.image} alt="" style={{ height: 120, objectFit: "cover", width: "100%" }} />
              <p style={{ fontWeight: 700, marginTop: 8 }}>{p.brand}</p>
              <p>{p.name}</p>
              <StatusChip bucket={effectiveBucket(p.id, state)} />
              <p style={{ marginTop: 8 }}>Occasion: {p.occasion}</p>
              <p>Fit read: {p.fitLine}</p>
              <p>
                Return path:{" "}
                {p.returnClass === "easy_return" ? "Returnable" : p.returnClass === "exchange_only" ? "Exchange only" : "Seal tag stays on"}
              </p>
              <PolicyChip policy={p.returnClass} />
              <p>Suggested size: {p.suggestedSize}{p.oosSizes.includes(p.suggestedSize) ? " · usual size out" : ""}</p>
              <p>₹{p.price.toLocaleString("en-IN")}</p>
              <Link href={`/item/${p.id}`} className="secondary" style={{ marginTop: 8 }}>
                See Verdict
              </Link>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 16 }}>Pick the piece you’d actually wear. A cheaper maybe is still a maybe.</p>
      </div>
    </div>
  );
}
