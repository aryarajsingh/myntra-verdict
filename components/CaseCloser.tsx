"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FLOW, placeFromPath } from "@/lib/flow";
import { LINKS } from "@/lib/links";

const NEXT: Record<string, { href: string; title: string; body: string }> = {
  discovery: {
    href: "/research/",
    title: "Research",
    body: "Six interviews, then the charts.",
  },
  research: {
    href: "/wishlist/",
    title: "Wishlist",
    body: "Open a Check fit item (blazer or Anarkali) → See Verdict.",
  },
  wishlist: {
    href: "/deck/",
    title: "Deck",
    body: "Ten slides. PDF is on the page.",
  },
  deck: {
    href: "/docs/",
    title: "Files",
    body: "Prompt, interviews, survey, workbook, PDF.",
  },
  files: {
    href: "/discovery/",
    title: "Discovery",
    body: "If you want to try another quote.",
  },
};

export function CaseCloser() {
  const path = usePathname();
  const place = placeFromPath(path);
  const idx = FLOW.findIndex((s) => s.id === place);
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
    <div className="case-closer no-print">
      {next && place !== "home" ? (
        <Link href={next.href} className="flow-next">
          <span className="flow-next-k">
            {place === "deck"
              ? "Case files"
              : place === "files"
                ? "Loop"
                : path.startsWith("/survey")
                  ? "Back"
                  : `Next · ${idx + 1} of ${FLOW.length}`}
          </span>
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
        <nav className="case-foot-nav" aria-label="Case">
          {FLOW.map((s, i) => (
            <Link key={s.id} href={s.href} className={place === s.id ? "on" : ""}>
              {i + 1} {s.label}
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
      </footer>
    </div>
  );
}
