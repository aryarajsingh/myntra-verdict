"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Wishlist" },
  { href: "/discovery", label: "Discovery" },
  { href: "/research", label: "Research" },
  { href: "/deck", label: "Deck" },
];

export function PrototypeBanner() {
  const path = usePathname();
  return (
    <div className="banner">
      <span>CONCEPT PROTOTYPE · Verdict · Not the Myntra app</span>
      <nav className="banner-links" aria-label="Case links">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
