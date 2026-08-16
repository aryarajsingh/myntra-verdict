"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PRODUCTS } from "@/data/products";
import { DEFAULT_STATE, loadState, type AppState } from "@/lib/state";

export function BagView() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  useEffect(() => setState(loadState()), []);
  const lines = state.bag
    .map((b) => ({ ...b, p: PRODUCTS.find((x) => x.id === b.id) }))
    .filter((x) => x.p);

  return (
    <div className="app-shell">
      <header className="header">
        <Link href="/" className="icon-btn" aria-label="Back">
          ←
        </Link>
        <h1>Bag</h1>
        <span className="icon-btn" />
      </header>
      <div className="pad">
        <p className="muted">Concept prototype. Checkout isn’t live.</p>
        {lines.length === 0 ? <p style={{ marginTop: 16 }}>Bag is empty. Add a size from Verdict first.</p> : null}
        {lines.map((l) => (
          <article key={l.id} className="wl-card" style={{ marginTop: 12 }}>
            <img src={l.p!.image} alt="" />
            <div>
              <p style={{ fontWeight: 600 }}>{l.p!.brand}</p>
              <p>{l.p!.name}</p>
              <p className="chip chip-policy">Size {l.size}</p>
              <p style={{ fontWeight: 700, marginTop: 8 }}>₹{l.p!.price.toLocaleString("en-IN")}</p>
            </div>
          </article>
        ))}
        <p style={{ margin: "16px 0" }}>You added a size on purpose. That’s the job of Verdict.</p>
        <button className="primary" type="button" disabled>
          Checkout isn’t part of this prototype
        </button>
        <Link href="/" className="ghost">
          Back to wishlist
        </Link>
      </div>
    </div>
  );
}
