import Link from "next/link";

const STEPS = [
  {
    t: "1. Business metric",
    d: "% of users who purchase ≥1 wishlisted item within 30 days of adding it.",
    href: "/deck/",
  },
  {
    t: "2. Product outcomes",
    d: "Revisit → still eligible → not just a bookmark → close uncertainty → pick among substitutes → bag a size → pay.",
    href: "/deck/",
  },
  {
    t: "3. AI discovery",
    d: "WhyWait: fit 625, return/seal-tag 400. Sale-wait is common. I disqualified it (N=1).",
    href: "/discovery/",
  },
  {
    t: "4. Primary research",
    d: "Six metro working women 24–32. Freeze is at wishlist revisit. PDP size advice doesn’t travel with the heart.",
    href: "/research/",
  },
  {
    t: "5. Problem",
    d: "Wishlist stores intent. It doesn’t close fit or return risk, so the decision happens off-app, after 30 days.",
    href: "/wishlist/",
  },
  {
    t: "6. Success metrics",
    d: "Leading: size-accepted bag-add. Guardrails: size-related returns flat, bag CTAs on Still exploring ~0.",
    href: "/deck/",
  },
  {
    t: "7. Risks",
    d: "Fake certainty, bookmark spam, “we already have size AI,” price-wait actually #1.",
    href: "/deck/",
  },
];

export function ThinkingEvo() {
  return (
    <div className="evo">
      {STEPS.map((s) => (
        <Link key={s.t} href={s.href} className="evo-step">
          <b>{s.t}</b>
          <span>{s.d}</span>
        </Link>
      ))}
    </div>
  );
}
