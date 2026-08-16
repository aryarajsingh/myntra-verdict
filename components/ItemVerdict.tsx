"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { productById, PRODUCTS } from "@/data/products";
import { PolicyChip, StatusChip } from "./StatusChip";
import { DEFAULT_STATE, DEMO_PROFILE, effectiveBucket, loadState, saveState, track, type AppState } from "@/lib/state";

const CHIPS = [
  "Does this run small?",
  "Will it shrink in the wash?",
  "Is M all right at my height?",
  "Office-appropriate?",
  "Can I return if I try it on?",
  "What if I cut the tag?",
];

const NFM = [
  "Fit still feels unsure",
  "Wrong for the occasion I had in mind",
  "I’m just saving this",
  "Looking at something else I saved",
  "Don’t want to deal with a return on this",
];

const DIS = [
  "This brand runs smaller on me",
  "This brand runs bigger on me",
  "I don’t wear my usual size in this silhouette",
  "The length note doesn’t match me",
  "I already own this cut — the read is wrong",
];

export function ItemVerdict() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const product = productById(id);
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [size, setSize] = useState("M");
  const [sheet, setSheet] = useState<null | "ask" | "nfm" | "dis" | "oos">(null);
  const [ask, setAsk] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [nfm, setNfm] = useState(NFM[0]);
  const [toast, setToast] = useState<string | null>(null);
  const [disSel, setDisSel] = useState<string[]>([]);

  useEffect(() => {
    const s = loadState();
    setState({ ...s, profile: s.profile ?? DEMO_PROFILE });
    if (product) setSize(product.suggestedSize === "Free" ? "Free" : product.suggestedSize);
    if (product) track("verdict_opened", { style_id: product.id });
  }, [product]);

  const bucket = useMemo(() => (state && product ? effectiveBucket(product.id, state) : "check_fit"), [state, product]);

  if (!product) {
    return (
      <div className="app-shell pad">
        <p>Item not found.</p>
        <Link href="/">Back to wishlist</Link>
      </div>
    );
  }

  function persist(next: AppState) {
    saveState(next);
    setState(next);
  }

  const locked = !state.profile;
  const suggestedOos = product.oosSizes.includes(size) || product.oosSizes.includes(product.suggestedSize);
  const bookmark = bucket === "exploring";
  const substitutes = product.substitutes.map((sid) => PRODUCTS.find((p) => p.id === sid)!).filter(Boolean);

  const returnCopy =
    product.returnClass === "easy_return"
      ? {
          title: "You can return this within the window on the item.",
          body: "Keep tags on. Pickup is the usual path. A return still costs you time — Verdict is here so you need that less, not so you skip the policy.",
        }
      : product.returnClass === "exchange_only"
        ? {
            title: "Size swap only. No return to bank.",
            body: "If the colour or cut isn’t you, you cannot send it back for a refund. That’s why this is rarely READY.",
          }
        : {
            title: "Trial is limited. Tag must stay sealed.",
            body: "Ethnic and occasion pieces often sit here. If you’re unsure you’ll wear it, leave it in Still exploring.",
          };

  function addToBag() {
    if (!product || !state) return;
    if (product.oosSizes.includes(size) || size === "Free") {
      setSheet("oos");
      track("bag_add_blocked_oos", { style_id: product.id });
      return;
    }
    const next: AppState = {
      profile: state.profile,
      skipped: state.skipped,
      bag: [...state.bag.filter((b) => b.id !== product.id), { id: product.id, size }],
      overrides: {
        ...state.overrides,
        [product.id]: { ...state.overrides[product.id], inBag: size },
      },
    };
    persist(next);
    setToast(`${size} added to bag.`);
    track("bag_add_from_verdict", { style_id: product.id, size });
  }

  return (
    <div className="app-shell">
      <header className="header">
        <button className="icon-btn" type="button" onClick={() => router.push("/")} aria-label="Back">
          ←
        </button>
        <h1>{product.brand}</h1>
        <Link href="/bag" className="icon-btn bag-badge" aria-label="Bag">
          Bag
          {state.bag.length ? <span className="bag-count">{state.bag.length}</span> : null}
        </Link>
      </header>
      <img className="hero-img" src={product.image} alt={`${product.brand} ${product.name}`} />
      <div className="pad">
        {locked ? (
          <div className="lock">
            <b>Verdict is locked</b>
            <p>Add usual sizes to see a fit read.</p>
            <Link href="/" className="primary">
              Set my sizes
            </Link>
          </div>
        ) : null}
        {state.overrides[product.id]?.disagreed ? (
          <div className="lock">
            <b>You flagged this read.</b>
            <p>We’re treating it as a check — not a sure thing.</p>
          </div>
        ) : null}
        <StatusChip bucket={bucket} />
        <h2 style={{ fontSize: 18, margin: "8px 0" }}>{product.verdictHeadline}</h2>
        <p className="muted">Based on shoppers close to your sizes and height band. Not a guarantee.</p>
        {state.profile ? (
          <p style={{ marginTop: 8 }}>
            Your profile · Tops {state.profile.top} · Bottoms {state.profile.bottom} · Ethnic {state.profile.ethnic} ·{" "}
            {state.profile.height} · {state.profile.fitPref}
          </p>
        ) : null}
        <p style={{ fontWeight: 700, marginTop: 8 }}>₹{product.price.toLocaleString("en-IN")}</p>
        <p>{product.name}</p>
        <button className="text-btn" type="button" onClick={() => setSheet("dis")}>
          This doesn’t match how I wear this
        </button>

        <h3 style={{ fontSize: 16, margin: "20px 0 8px" }}>How this cut has gone for shoppers like you</h3>
        <p>Among {product.kept + product.exchanged + product.returned} analog orders of this cut from shoppers near your size:</p>
        <div className="fit-bar">
          <div className="fit-cell kept">
            <span>Kept</span>
            <b>{product.kept}%</b>
          </div>
          <div className="fit-cell ex">
            <span>Exchanged size</span>
            <b>{product.exchanged}%</b>
          </div>
          <div className="fit-cell ret">
            <span>Returned</span>
            <b>{product.returned}%</b>
          </div>
        </div>
        <p className="muted">Kept means they didn’t send it back. It does not mean it looked perfect.</p>
        <ul>
          {product.fitBullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p>{product.garmentNote}</p>

        {product.suggestedSize !== "Free" ? (
          <>
            <h3 style={{ fontSize: 16, margin: "20px 0 8px" }}>Suggested size</h3>
            <p className="muted">
              {bucket === "ready"
                ? `${product.suggestedSize} is the cautious pick for your usual size.`
                : `Your usual size is ${product.suggestedSize}. Reviews also mention ${product.altSize}.`}
            </p>
            <div className="size-row" style={{ marginTop: 8 }}>
              {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`size-btn ${size === s ? "selected" : ""} ${s === product.suggestedSize ? "suggested" : ""} ${
                    product.oosSizes.includes(s) ? "oos" : ""
                  }`}
                  onClick={() => setSize(s)}
                >
                  {s}
                  {s === product.suggestedSize ? " · SUGGESTED" : ""}
                  {product.oosSizes.includes(s) ? " · OUT" : ""}
                </button>
              ))}
            </div>
            {suggestedOos ? (
              <p style={{ marginTop: 8 }}>{product.suggestedSize} is suggested, and it’s not in right now.</p>
            ) : null}
            <p className="muted" style={{ marginTop: 8 }}>
              You can still pick another size. Wrong size is the usual reason this cut comes back.
            </p>
          </>
        ) : (
          <p style={{ marginTop: 16 }}>Free size drape. Fit is not the main risk — the seal tag is.</p>
        )}

        <h3 style={{ fontSize: 16, margin: "20px 0 8px" }}>From people who bought {product.suggestedSize}</h3>
        {product.reviews.map((r) => (
          <div key={r.quote} className="card" style={{ marginBottom: 8 }}>
            <p className="muted">
              Size {r.size} · height {r.height} · {r.fitPref}
            </p>
            <p style={{ margin: "8px 0" }}>{r.quote}</p>
            <span className="chip chip-policy">{r.outcome}</span>
          </div>
        ))}
        <p className="muted">These are snippets, not a full review wall.</p>

        <h3 style={{ fontSize: 16, margin: "20px 0 8px" }}>If it doesn’t work</h3>
        <PolicyChip policy={product.returnClass} />
        <p style={{ fontWeight: 700, marginTop: 8 }}>{returnCopy.title}</p>
        <p>{returnCopy.body}</p>
        <p style={{ marginTop: 8 }}>{product.occasionLine}</p>

        <h3 style={{ fontSize: 16, margin: "20px 0 8px" }}>Other saved pieces for the same job</h3>
        <p className="muted">Compared on fit and occasion — not on discount.</p>
        <div className="compare" style={{ marginTop: 8 }}>
          {substitutes.map((s) => (
            <div key={s.id} className="col">
              <img src={s.image} alt="" style={{ height: 80, width: "100%", objectFit: "cover" }} />
              <StatusChip bucket={effectiveBucket(s.id, state)} />
              <p style={{ fontWeight: 600, marginTop: 8 }}>{s.brand}</p>
              <p>{s.name}</p>
              <p>Occasion: {s.occasion}</p>
              <p>Fit: {s.fitLine}</p>
              <p>Return: {s.returnClass === "easy_return" ? "Returnable" : s.returnClass === "exchange_only" ? "Exchange only" : "Seal tag stays on"}</p>
              <Link href={`/item/${s.id}`} className="secondary" style={{ marginTop: 8 }}>
                See Verdict
              </Link>
            </div>
          ))}
        </div>
        <Link href={`/compare/${product.id}`} className="text-btn">
          Compare on fit & occasion
        </Link>

        <h3 style={{ fontSize: 16, margin: "20px 0 8px" }}>Still unsure?</h3>
        <p>Ask about length, shrink, office-appropriateness, or returns. We’ll answer from this item’s policy and reviews.</p>
        <button className="secondary" type="button" style={{ marginTop: 8 }} onClick={() => setSheet("ask")} disabled={locked}>
          Ask a doubt
        </button>
      </div>

      <div className="sticky-cta">
        {bookmark ? (
          <>
            <p>We are not treating this as a purchase queue.</p>
            <button
              className="primary"
              type="button"
              onClick={() => {
                persist({
                  ...state,
                  overrides: { ...state.overrides, [product.id]: { ...state.overrides[product.id], bucket: "check_fit" } },
                });
                setToast("Moved to Check fit. Open Verdict when you’re ready.");
                track("intent_upgraded", { style_id: product.id });
              }}
            >
              I might buy this
            </button>
            <button
              className="ghost"
              type="button"
              onClick={() => {
                setToast("Left in Still exploring. We won’t nudge this.");
                track("marked_bookmark", { style_id: product.id });
              }}
            >
              Keep saving
            </button>
          </>
        ) : suggestedOos && size === product.suggestedSize ? (
          <>
            <button className="primary" type="button" onClick={() => setSheet("oos")}>
              See other sizes or substitutes
            </button>
            <button className="secondary" type="button" onClick={() => setSheet("nfm")}>
              Not for me
            </button>
          </>
        ) : (
          <>
            <button className="primary" type="button" onClick={addToBag} disabled={locked || product.suggestedSize === "Free"}>
              Add {size} to bag
            </button>
            <button className="secondary" type="button" onClick={() => setSheet("nfm")}>
              Not for me
            </button>
            <p className="muted" style={{ textAlign: "center" }}>
              Bagging is not a promise it will fit.
            </p>
          </>
        )}
      </div>

      {sheet ? (
        <div className="sheet-scrim" onClick={() => setSheet(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <button className="ghost" type="button" onClick={() => setSheet(null)}>
              Close
            </button>
            {sheet === "ask" && (
              <>
                <h2 style={{ fontSize: 16 }}>Ask a doubt</h2>
                <p>Short answers from this item’s reviews and return rules. Not a stylist on video call.</p>
                <div className="chip-row" style={{ margin: "12px 0" }}>
                  {CHIPS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="filter"
                      onClick={() => {
                        setAsk(c);
                        setAnswer(product.faqs[c] || "I can help on fit, size, length, fabric, office use, and returns for this piece.");
                        track("ask_chip", { style_id: product.id });
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <textarea
                  value={ask}
                  onChange={(e) => setAsk(e.target.value)}
                  placeholder="Ask about fit, fabric, length, or returns"
                  rows={3}
                  style={{ width: "100%", padding: 8 }}
                />
                <button
                  className="primary"
                  type="button"
                  disabled={!ask.trim()}
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    const hit = CHIPS.find((c) => ask.toLowerCase().includes(c.toLowerCase().slice(0, 10)));
                    setAnswer(
                      (hit && product.faqs[hit]) ||
                        "I can help on fit, size, length, fabric, office use, and returns for this piece. Try a chip, or ask in those words."
                    );
                    track("ask_freetext", { style_id: product.id });
                  }}
                >
                  Send
                </button>
                {answer ? (
                  <div className="card" style={{ marginTop: 12 }}>
                    <p className="muted">A cautious read</p>
                    <p>{answer}</p>
                    <p className="muted" style={{ marginTop: 8 }}>
                      If this still feels off, don’t bag it.
                    </p>
                  </div>
                ) : null}
              </>
            )}
            {sheet === "nfm" && (
              <>
                <h2 style={{ fontSize: 16 }}>Not for me</h2>
                <p>We’ll take it out of Ready / Check fit. It stays in your wishlist unless you remove it.</p>
                {NFM.map((r) => (
                  <button key={r} type="button" className={`radio-row ${nfm === r ? "selected" : ""}`} onClick={() => setNfm(r)}>
                    {r}
                  </button>
                ))}
                <button
                  className="primary"
                  type="button"
                  onClick={() => {
                    persist({
                      ...state,
                      overrides: {
                        ...state.overrides,
                        [product.id]: { ...state.overrides[product.id], bucket: "exploring" },
                      },
                    });
                    setSheet(null);
                    setToast("Moved to Still exploring. It’s still in your wishlist.");
                    track("not_for_me", { style_id: product.id });
                    router.push("/");
                  }}
                >
                  Move this item
                </button>
              </>
            )}
            {sheet === "dis" && (
              <>
                <h2 style={{ fontSize: 16 }}>This doesn’t match how I wear this</h2>
                <p>Tell us where the read feels off. We’ll treat the item as a check, not a sure thing.</p>
                {DIS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`radio-row ${disSel.includes(r) ? "selected" : ""}`}
                    onClick={() => setDisSel((d) => (d.includes(r) ? d.filter((x) => x !== r) : [...d, r]))}
                  >
                    {r}
                  </button>
                ))}
                <button
                  className="primary"
                  type="button"
                  onClick={() => {
                    persist({
                      ...state,
                      overrides: {
                        ...state.overrides,
                        [product.id]: { ...state.overrides[product.id], bucket: "check_fit", disagreed: true },
                      },
                    });
                    setSheet(null);
                    setToast("Noted. This sits in Check fit now — not a guarantee.");
                    track("verdict_disagreed", { style_id: product.id });
                  }}
                >
                  Update my read
                </button>
              </>
            )}
            {sheet === "oos" && (
              <>
                <h2 style={{ fontSize: 16 }}>{product.suggestedSize} isn’t available</h2>
                <p>We won’t silently bag {product.altSize}. That’s how wrong-size returns start.</p>
                <button
                  className="radio-row"
                  type="button"
                  onClick={() => {
                    setSize(product.altSize);
                    setSheet(null);
                  }}
                >
                  <b>See {product.altSize} instead</b>
                  <div className="muted">Next in-stock size. Fit read is weaker.</div>
                </button>
                <button
                  className="radio-row"
                  type="button"
                  onClick={() => {
                    setSheet(null);
                    setToast("We’ll mark this in the prototype. No email in this demo.");
                  }}
                >
                  <b>Notify when {product.suggestedSize} is back</b>
                  <div className="muted">A stock note, not a sale alert.</div>
                </button>
                <Link href={`/compare/${product.id}`} className="secondary">
                  Compare saved pieces
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="toast">
          {toast}
          <Link href="/bag">View bag</Link>
          <button type="button" onClick={() => setToast(null)}>
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
