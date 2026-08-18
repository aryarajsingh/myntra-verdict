"use client";

import Link from "next/link";
import { createContext, useContext, useState } from "react";
import { FLOW } from "@/lib/flow";
import { LINKS } from "@/lib/links";
import { Modal } from "@/components/Modal";

const TourCtx = createContext<{ open: () => void }>({ open: () => {} });
export function useTour() {
  return useContext(TourCtx);
}

const STEPS = [
  {
    t: "This URL is the submission",
    d: "Nav is Discovery, Research, Wishlist, Deck. Files and the PDF are in the footer. Not the Myntra app.",
  },
  {
    t: "Discovery runs a real model",
    d: "Click Run extracts. Each sample quote hits POST /api/extract on Groq. Then open Test the model and try EORS (should DISQUALIFY) and Fit freeze.",
  },
  {
    t: "Then research, then the MVP",
    d: "Research is the six rooms, a survey link, charts, and the takeaway. Wishlist is the product — open a Check fit item and tap See Verdict.",
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
              <Link href="/discovery/" className="primary" onClick={close}>
                Discovery
              </Link>
            )}
            <a href={LINKS.github} className="secondary" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <button className="ghost" type="button" onClick={close}>
              Close
            </button>
          </div>
        </Modal>
      ) : null}
    </TourCtx.Provider>
  );
}
