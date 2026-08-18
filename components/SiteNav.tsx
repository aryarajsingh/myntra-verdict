"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FLOW, placeFromPath } from "@/lib/flow";
import { LINKS } from "@/lib/links";
import { useTour } from "@/components/LayoutTour";

function isOn(path: string, href: string) {
  const place = placeFromPath(path);
  const stem = href.replace(/\/$/, "");
  if (stem === "/discovery") return place === "discovery";
  if (stem === "/research") return place === "research";
  if (stem === "/wishlist") return place === "wishlist";
  if (stem === "/deck") return place === "deck";
  if (stem === "/docs") return place === "files";
  return path === stem || path.startsWith(`${stem}/`);
}

export function SiteNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const tour = useTour();

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <header className="nav no-print">
      <Link href="/" className="nav-mark" aria-label="Verdict home">
        Verdict
      </Link>
      <nav className="nav-links" aria-label="Case">
        {FLOW.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`nav-link ${isOn(path, l.href) ? "on" : ""}`}
            aria-current={isOn(path, l.href) ? "page" : undefined}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <a href={LINKS.pdf} className="nav-pdf">
        PDF
      </a>
      <a href={LINKS.github} className="nav-pdf" target="_blank" rel="noreferrer">
        Code
      </a>
      <button className="nav-pdf nav-help" type="button" onClick={tour.open}>
        What’s here
      </button>
      <span className="nav-chip">Not the Myntra app</span>
      <button
        className="nav-burger"
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>
      {open ? (
        <div className="nav-drawer">
          <Link href="/" onClick={() => setOpen(false)}>
            Home
            <span>Case start</span>
          </Link>
          {FLOW.map((l) => (
            <Link key={l.href} href={l.href} className={isOn(path, l.href) ? "on" : ""} onClick={() => setOpen(false)}>
              {l.label}
              <span>{l.blurb.split(".")[0]}</span>
            </Link>
          ))}
          <Link href="/docs/" onClick={() => setOpen(false)} className={isOn(path, "/docs/") ? "on" : ""}>
            Files
            <span>Supporting links</span>
          </Link>
          <a href={LINKS.pdf} onClick={() => setOpen(false)}>
            PDF
            <span>10-slide deck</span>
          </a>
          <a href={LINKS.github} onClick={() => setOpen(false)} target="_blank" rel="noreferrer">
            Code
            <span>Repo</span>
          </a>
          <button type="button" onClick={() => { setOpen(false); tour.open(); }}>
            What’s here
            <span>Short map</span>
          </button>
        </div>
      ) : null}
    </header>
  );
}
