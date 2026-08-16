"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PRODUCTS } from "@/data/products";
import type { Bucket, Profile } from "@/data/types";
import { PolicyChip, StatusChip } from "./StatusChip";
import { DEFAULT_STATE, DEMO_PROFILE, effectiveBucket, loadState, saveState, track, type AppState } from "@/lib/state";

const TOPS = ["XS", "S", "M", "L", "XL", "XXL"];
const HEIGHTS = [
  { v: "Under 5'2\"", h: "Petite length usually matters" },
  { v: "5'2\" – 5'5\"", h: "Most common band in our reads" },
  { v: "5'5\" – 5'8\"", h: "Watch crop and midi length" },
  { v: "Above 5'8\"", h: "Inseam and kurta length often run short" },
];
const FITS: Profile["fitPref"][] = ["Fitted", "Regular", "Relaxed"];
const FIT_HELP: Record<Profile["fitPref"], string> = {
  Fitted: "Close through the body. I size carefully.",
  Regular: "Easy through the body. Not tight, not oversized.",
  Relaxed: "I like room. I avoid anything clingy.",
};

function Header({ bagCount }: { bagCount: number }) {
  return (
    <header className="header">
      <span className="icon-btn" aria-hidden />
      <h1>Wishlist</h1>
      <Link href="/bag" className="icon-btn bag-badge" aria-label={`Bag, ${bagCount} items`}>
        Bag
        {bagCount > 0 ? <span className="bag-count">{bagCount}</span> : null}
      </Link>
    </header>
  );
}

export function WishlistHome() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [draft, setDraft] = useState<Partial<Profile>>(DEMO_PROFILE);
  const [filter, setFilter] = useState<"all" | Bucket>("all");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const s = loadState();
    const next = { ...s, profile: s.profile ?? DEMO_PROFILE };
    saveState(next);
    setState(next);
    setStep(0);
    track("wishlist_viewed");
  }, []);

  function persist(next: AppState) {
    saveState(next);
    setState(next);
  }

  const visible = useMemo(() => {
    if (!state) return [];
    return PRODUCTS.filter((p) => !state.overrides[p.id]?.removed).map((p) => ({
      p,
      bucket: effectiveBucket(p.id, state),
      inBag: state.overrides[p.id]?.inBag,
    }));
  }, [state]);

  if (step >= 1 && step <= 4) {
    return (
      <div className="app-shell">
        <header className="header">
          <button className="icon-btn" type="button" onClick={() => (step === 1 ? setStep(0) : setStep((step - 1) as 1))}>
            {step === 1 ? "×" : "←"}
          </button>
          <h1>{step === 1 ? "Verdict" : step === 2 ? "Your usual sizes" : step === 3 ? "Your height" : "How you like clothes to sit"}</h1>
          <span className="icon-btn" />
        </header>
        <div className="pad">
          {step === 1 && (
            <>
              <p className="muted">Verdict</p>
              <h2 style={{ fontSize: 18, margin: "8px 0" }}>
                Know if a saved piece is likely to work on you — before you bag it.
              </h2>
              <p>
                Verdict reads how this cut has sat on shoppers close to your size, and whether sending it back is
                straightforward. It is a read of reviews and return rules. Not a fitting room. Not a guarantee.
              </p>
              <ul>
                <li>No photo needed. We don’t try clothes on a picture of you.</li>
                <li>Usual sizes, height band, how you like clothes to sit. That’s it.</li>
                <li>We’ll stay cautious when reviews disagree.</li>
              </ul>
              <button className="primary" type="button" onClick={() => setStep(2)}>
                Continue
              </button>
              <button
                className="ghost"
                type="button"
                onClick={() => {
                  persist({ ...state, skipped: true });
                  setStep(0);
                  track("onboarding_skipped");
                }}
              >
                Skip for now
              </button>
              <p className="muted">You can still open your wishlist. Verdict stays locked till sizes are in.</p>
            </>
          )}
          {step === 2 && (
            <>
              <p className="muted">Step 2 of 4</p>
              <h2 style={{ fontSize: 18, margin: "8px 0" }}>What do you usually pick?</h2>
              <p>Ethnicwear often runs differently from tops. That’s why we ask three times.</p>
              {(
                [
                  ["Tops & western", "top"],
                  ["Bottoms", "bottom"],
                  ["Kurtas & ethnicwear", "ethnic"],
                ] as const
              ).map(([label, key]) => (
                <div key={key} style={{ marginTop: 16 }}>
                  <p style={{ fontWeight: 600 }}>{label}</p>
                  <div className="size-row" style={{ marginTop: 8 }}>
                    {TOPS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`size-btn ${draft[key] === s ? "selected" : ""}`}
                        onClick={() => setDraft({ ...draft, [key]: s })}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <p className="muted" style={{ margin: "12px 0" }}>
                If you’re between sizes, pick the one you keep more often.
              </p>
              <button
                className="primary"
                type="button"
                disabled={!draft.top || !draft.bottom || !draft.ethnic}
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </>
          )}
          {step === 3 && (
            <>
              <p className="muted">Step 3 of 4</p>
              <h2 style={{ fontSize: 18, margin: "8px 0" }}>Which band are you in?</h2>
              <p>Used for length, crop, and palazzo/kurta rise — not to judge anyone.</p>
              <div style={{ marginTop: 12 }}>
                {HEIGHTS.map((h) => (
                  <button
                    key={h.v}
                    type="button"
                    className={`radio-row ${draft.height === h.v ? "selected" : ""}`}
                    onClick={() => setDraft({ ...draft, height: h.v })}
                  >
                    <b>{h.v}</b>
                    <div className="muted">{h.h}</div>
                  </button>
                ))}
              </div>
              <button className="primary" type="button" disabled={!draft.height} onClick={() => setStep(4)}>
                Continue
              </button>
            </>
          )}
          {step === 4 && (
            <>
              <p className="muted">Step 4 of 4</p>
              <h2 style={{ fontSize: 18, margin: "8px 0" }}>What’s your default?</h2>
              <p>We’ll flag a bodycon if you prefer relaxed, and a boxy shirt if you prefer fitted. You can still buy either.</p>
              <div style={{ marginTop: 12 }}>
                {FITS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`radio-row ${draft.fitPref === f ? "selected" : ""}`}
                    onClick={() => setDraft({ ...draft, fitPref: f })}
                  >
                    <b>{f}</b>
                    <div className="muted">{FIT_HELP[f]}</div>
                  </button>
                ))}
              </div>
              <p className="muted" style={{ margin: "12px 0" }}>
                This does not guarantee fit. Brands still cut differently.
              </p>
              <button
                className="primary"
                type="button"
                onClick={() => {
                  const profile = draft as Profile;
                  persist({ ...state, profile, skipped: false });
                  setStep(0);
                  setToast("Sizes saved. Verdict will stay cautious where reviews disagree.");
                  track("onboarding_completed");
                }}
              >
                See my wishlist
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const groups: { id: Bucket; title: string; sub: string }[] = [
    { id: "ready", title: "Ready", sub: "Fit read is aligned. Return path is clear. Still not a guarantee." },
    { id: "check_fit", title: "Check fit", sub: "Size or length is mixed. Open Verdict before you bag." },
    { id: "exploring", title: "Still exploring", sub: "Looks like a bookmark, a maybe-occasion, or a piece we won’t push." },
  ];

  const filtered = visible.filter((x) => filter === "all" || x.bucket === filter);

  return (
    <div className="app-shell">
      <Header bagCount={state.bag.length} />
      <div className="pad">
        <p className="muted">{visible.length} saved</p>
        <p style={{ margin: "4px 0 8px", fontWeight: 700 }}>
          Each card has a Verdict: Ready, Check fit, or Still exploring.
        </p>
        <p style={{ margin: "0 0 12px" }}>Grouped by how ready each piece looks for you — not by discount.</p>
        <p className="muted">
          Demo profile · Tops {state.profile?.top} · Bottoms {state.profile?.bottom} · Ethnic {state.profile?.ethnic} ·{" "}
          {state.profile?.height} · {state.profile?.fitPref} ·{" "}
          <button className="text-btn" type="button" onClick={() => setStep(2)}>
            Edit sizes
          </button>
        </p>
        <div className="filters">
          {(["all", "ready", "check_fit", "exploring"] as const).map((f) => (
            <button key={f} type="button" className={`filter ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "ready" ? "Ready" : f === "check_fit" ? "Check fit" : "Still exploring"}
            </button>
          ))}
        </div>
        {groups
          .filter((g) => filter === "all" || filter === g.id)
          .map((g) => {
            const items = filtered.filter((x) => x.bucket === g.id);
            return (
              <section key={g.id} style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 16, display: "flex", gap: 8, alignItems: "center" }}>
                  {g.title} <StatusChip bucket={g.id} /> <span className="muted">{items.length}</span>
                </h2>
                <div className={`group-bar ${g.id === "check_fit" ? "fit" : g.id === "ready" ? "ready" : "explore"}`} />
                <p className="muted">{g.sub}</p>
                {items.length === 0 ? <p style={{ marginTop: 8 }}>Nothing in this group right now.</p> : null}
                {items.map(({ p, bucket, inBag }) => (
                  <article key={p.id} className="wl-card">
                    <img src={p.image} alt={`${p.brand} ${p.name}`} />
                    <div>
                      <StatusChip bucket={bucket} />
                      <p style={{ fontWeight: 600, marginTop: 6 }}>{p.brand}</p>
                      <p>{p.name}</p>
                      <p style={{ fontWeight: 700 }}>₹{p.price.toLocaleString("en-IN")}</p>
                      <span className="chip chip-reason">{p.saveReason}</span>{" "}
                      <PolicyChip policy={p.returnClass} />
                      <p style={{ margin: "8px 0" }}>{p.fitLine}</p>
                      {inBag ? <p className="chip chip-policy">IN BAG</p> : null}
                      <Link href={`/item/${p.id}`} className="primary" style={{ marginTop: 8 }}>
                        {bucket === "exploring" ? "See why it’s here" : "See Verdict"}
                      </Link>
                    </div>
                  </article>
                ))}
              </section>
            );
          })}
      </div>
      {toast ? (
        <div className="toast">
          {toast}
          <button type="button" onClick={() => setToast(null)}>
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
