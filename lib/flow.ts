export const FLOW = [
  {
    id: "discovery",
    href: "/discovery/",
    label: "Discovery",
    blurb: "Score public reviews. Groq extracts quotes. Test the model on a sample.",
    time: "8 min",
  },
  {
    id: "research",
    href: "/research/",
    label: "Research",
    blurb: "Six interviews, a survey link, charts, then what I take from it.",
    time: "8 min",
  },
  {
    id: "wishlist",
    href: "/wishlist/",
    label: "Wishlist",
    blurb: "Ready / Check fit / Still exploring. Open Verdict on a Check fit item.",
    time: "5 min",
  },
  {
    id: "deck",
    href: "/deck/",
    label: "Deck",
    blurb: "Ten slides. PDF is on the page.",
    time: "5 min",
  },
] as const;

export type FlowId = (typeof FLOW)[number]["id"];

export type Place = "home" | FlowId | "files";

export function placeFromPath(path: string): Place {
  const p = path.replace(/\/$/, "") || "/";
  if (p === "/") return "home";
  if (p.startsWith("/discovery")) return "discovery";
  if (p.startsWith("/research") || p.startsWith("/survey")) return "research";
  if (p.startsWith("/wishlist") || p.startsWith("/item") || p.startsWith("/bag") || p.startsWith("/compare")) {
    return "wishlist";
  }
  if (p.startsWith("/deck")) return "deck";
  if (p.startsWith("/docs")) return "files";
  return "home";
}
