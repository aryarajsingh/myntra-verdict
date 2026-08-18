export type Artefact = {
  id: string;
  part: string;
  title: string;
  body: string;
  href: string;
  kind: "Live" | "PDF" | "Notes" | "Workbook" | "CSV" | "Prompt";
};

export function artefacts(): Artefact[] {
  return [
    {
      id: "01",
      part: "Part 1",
      title: "WhyWait engine",
      body: "Groq extract on sample quotes, then F×S×M×N. Test the model on Fit freeze / EORS.",
      href: "/discovery/",
      kind: "Live",
    },
    {
      id: "02",
      part: "Part 1",
      title: "Extraction prompt",
      body: "System prompt + JSON fields. Same schema POST /api/extract uses.",
      href: "/discovery/extract-prompt.md",
      kind: "Prompt",
    },
    {
      id: "03",
      part: "Part 5",
      title: "Wishlist MVP",
      body: "Ready / Check fit / Still exploring. No coupons.",
      href: "/wishlist/",
      kind: "Live",
    },
    {
      id: "04",
      part: "Deck",
      title: "10-slide deck (live)",
      body: "Ten slides. 14pt. No fellow name on the slides.",
      href: "/deck/",
      kind: "Live",
    },
    {
      id: "05",
      part: "Deck",
      title: "Deck PDF",
      body: "The file to attach. Same ten slides.",
      href: "/Verdict-Wishlist-Deck.pdf",
      kind: "PDF",
    },
    {
      id: "06",
      part: "Part 3",
      title: "Six interviews",
      body: "All eight brief prompts. Metro working women.",
      href: "/research/",
      kind: "Live",
    },
    {
      id: "07",
      part: "Part 3",
      title: "Interview notes (markdown)",
      body: "Plain-text copy of the rooms.",
      href: "/research.md",
      kind: "Notes",
    },
    {
      id: "08",
      part: "Part 3",
      title: "Survey",
      body: "Counts from the panel. Questions listed on the page.",
      href: "/survey/",
      kind: "Live",
    },
    {
      id: "09",
      part: "Part 3",
      title: "Questionnaire",
      body: "Click-through of the questions. You don’t need to submit. Responses are in the workbook.",
      href: "/survey/form/",
      kind: "Live",
    },
    {
      id: "10",
      part: "Part 3",
      title: "Survey workbook (xlsx)",
      body: "48 responses, codebook, Analysis cuts. The supporting database.",
      href: "/survey/Wishlist-survey-workbook.xlsx",
      kind: "Workbook",
    },
    {
      id: "11",
      part: "Part 3",
      title: "Responses CSV",
      body: "Same panel as the Responses tab.",
      href: "/survey/responses.csv",
      kind: "CSV",
    },
    {
      id: "12",
      part: "Part 3",
      title: "Instrument CSV",
      body: "Field IDs, types, options, brief mapping.",
      href: "/survey/instrument.csv",
      kind: "CSV",
    },
    {
      id: "13",
      part: "Part 3",
      title: "Codebook CSV",
      body: "How Q3 / Q5 / Q8 / Q12 recode.",
      href: "/survey/codebook.csv",
      kind: "CSV",
    },
    {
      id: "14",
      part: "Repo",
      title: "Source on GitHub",
      body: "Source. Submit https://myntra-verdict.vercel.app/ — not this repo.",
      href: "https://github.com/aryarajsingh/myntra-verdict",
      kind: "Live",
    },
  ];
}
