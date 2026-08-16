"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/discovery", label: "Discovery" },
  { href: "/wishlist", label: "MVP" },
  { href: "/research", label: "Research" },
  { href: "/deck", label: "Deck" },
];

export function PrototypeBanner() {
  const path = usePathname();
  return (
    <div className="banner">
      <span>CONCEPT PROTOTYPE · not the Myntra app</span>
      <nav className="banner-links" aria-label="Case links">
        {LINKS.map((l) => {
          const on = l.href === "/" ? path === "/" : path === l.href || path.startsWith(`${l.href}/`);
          return (
            <Link key={l.href} href={l.href} aria-current={on ? "page" : undefined}>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
