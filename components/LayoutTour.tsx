"use client";

import Link from "next/link";
import { createContext, useContext, useState } from "react";
import { FLOW } from "@/lib/flow";
import { Modal } from "@/components/Modal";

const TourCtx = createContext<{ open: () => void }>({ open: () => {} });
export function useTour() {
  return useContext(TourCtx);
}

const STEPS = [
  {
    t: "This URL is the submission",
    d: "Four tabs: Discovery (the model), Research (interviews), MVP (the product — a wishlist), Deck (10 slides). Not the Myntra app.",
  },
  {
    t: "Discovery is how you test the model",
    d: "You land on Try a quote. Click Fit freeze — Groq should return fit. Then EORS wait — it must come back sale-wait and DISQUALIFIED. The result card is the output. Optional: Check all 7 vs my labels.",
  },
  {
    t: "MVP is the wishlist product",
    d: "Not more research. Saved items sit in Ready / Check fit / Still exploring. Open a Check fit card (blazer or Anarkali) and tap See Verdict. That card is the intervention.",
  },
  {
    t: "Deck is 10 slides",
    d: "Same argument as the site. PDF download is on that page.",
  },
];

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  const [i, setI] = useState(0);

  function close() {
    setOn(false);
    setI(0);
  }

  const step = STEPS[i];

  return (
    <TourCtx.Provider value={{ open: () => { setI(0); setOn(true); } }}>
      {children}
      {on ? (
        <Modal kicker={`${i + 1} / ${STEPS.length}`} title={step.t} onClose={close}>
          <p className="hub-lede" style={{ margin: 0 }}>
            {step.d}
          </p>
          <ol className="tour-map">
            {FLOW.map((s, n) => (
              <li key={s.id}>
                <Link href={s.href} onClick={close}>
                  {n + 1} {s.label}
                </Link>
                <span>{s.blurb}</span>
              </li>
            ))}
          </ol>
          <div className="path-ctas" style={{ marginTop: 20 }}>
            {i > 0 ? (
              <button className="secondary" type="button" onClick={() => setI((n) => n - 1)}>
                Back
              </button>
            ) : null}
            {i < STEPS.length - 1 ? (
              <button className="primary" type="button" onClick={() => setI((n) => n + 1)}>
                Next
              </button>
            ) : (
              <Link href="/discovery/#try" className="primary" onClick={close}>
                Try a quote
              </Link>
            )}
            <button className="ghost" type="button" onClick={close}>
              Close
            </button>
          </div>
        </Modal>
      ) : null}
    </TourCtx.Provider>
  );
}
