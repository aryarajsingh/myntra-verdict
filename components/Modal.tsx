"use client";

import { useEffect } from "react";

export function Modal({
  title,
  kicker,
  onClose,
  children,
  wide,
}: {
  title: string;
  kicker?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="modal-root no-print" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="modal-scrim" type="button" aria-label="Close" onClick={onClose} />
      <div className={`modal-card ${wide ? "wide" : ""}`}>
        <header className="modal-head">
          <div>
            {kicker ? <p className="hub-kicker">{kicker}</p> : null}
            <h2 id="modal-title">{title}</h2>
          </div>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
