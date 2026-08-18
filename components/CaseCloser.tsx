"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FLOW, isProductSurface, placeFromPath } from "@/lib/flow";
import { LINKS } from "@/lib/links";

const NEXT: Record<string, { href: string; title: string; body: string } | null> = {
  discovery: {
    href: "/wishlist/",
    title: "Product",
    body: "Pinned Check fit blazer → See Verdict.",
  },
  research: {
    href: "/wishlist/",
    title: "Product",
    body: "The wishlist. Open the pinned Check fit blazer → See Verdict.",
  },
  wishlist: {
    href: "/deck/",
    title: "Deck",
    body: "Ten slides that argue for this product.",
  },
  deck: null,
  files: {
    href: "/discovery/",
    title: "Live model",
    body: "Send Fit freeze, then EORS wait.",
  },
};

export function CaseCloser() {
  const path = usePathname();
  const place = placeFromPath(path);
  const product = isProductSurface(path);
  const next = path.startsWith("/survey/form")
    ? {
        href: "/survey/",
        title: "Survey questions",
        body: "You don’t need the questionnaire. The 48 rows are in the workbook.",
      }
    : path.startsWith("/survey")
      ? {
          href: "/research/",
          title: "Research",
          body: "Charts and the takeaway are with the interviews.",
        }
      : NEXT[place];

  return (
    <div className={`case-closer no-print${product ? " product-focus" : ""}`}>
      {next && place !== "home" ? (
        <Link href={next.href} className="flow-next">
          <span className="flow-next-k">{product ? "Next" : path.startsWith("/survey") ? "Back" : "Next"}</span>
          <span className="flow-next-t">{next.title}</span>
          <span className="flow-next-b">{next.body}</span>
          <span className="flow-next-go">Continue</span>
        </Link>
      ) : null}

      <footer className="case-foot">
        <p className="case-foot-mark">
          <Link href="/">Verdict</Link>
          <span>Myntra Growth case · not the Myntra app · no coupons</span>
        </p>
        {product ? null : (
          <nav className="case-foot-nav" aria-label="Case">
            {FLOW.map((s) => (
              <Link key={s.id} href={s.href} className={place === s.id ? "on" : ""}>
                {s.label}
              </Link>
            ))}
            <Link href="/docs/" className={place === "files" ? "on" : ""}>
              Files
            </Link>
            <a href={LINKS.pdf}>PDF</a>
            <a href={LINKS.github} target="_blank" rel="noreferrer">
              Code
            </a>
          </nav>
        )}
      </footer>
    </div>
  );
}
