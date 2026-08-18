/** Public origin for README. Deck/PDF hrefs use `casePath` so the fellow username is not in the file. */
export const LIVE = (process.env.NEXT_PUBLIC_SITE_URL || "https://myntra-verdict.vercel.app").replace(/\/$/, "");

export function casePath(path: string) {
  const hashIdx = path.indexOf("#");
  const hash = hashIdx >= 0 ? path.slice(hashIdx) : "";
  const stem = hashIdx >= 0 ? path.slice(0, hashIdx) : path;
  const p = stem.startsWith("/") ? stem : `/${stem}`;
  return `${LIVE}${p}${hash}`;
}

export const LINKS = {
  home: casePath("/"),
  discovery: casePath("/discovery/"),
  brief: casePath("/discovery/#brief"),
  mvp: casePath("/wishlist/"),
  research: casePath("/research/"),
  notes: casePath("/research.md"),
  docs: casePath("/docs/"),
  survey: casePath("/survey/"),
  surveyXlsx: casePath("/survey/Wishlist-survey-workbook.xlsx"),
  surveyCsv: casePath("/survey/responses.csv"),
  surveyInstrument: casePath("/survey/instrument.csv"),
  surveyCodebook: casePath("/survey/codebook.csv"),
  surveyForm: casePath("/survey/form/"),
  surveySheet: casePath("/survey/Wishlist-survey-workbook.xlsx"),
  extractPrompt: casePath("/discovery/extract-prompt.md"),
  deck: casePath("/deck/"),
  pdf: casePath("/Verdict-Wishlist-Deck.pdf"),
  github: "https://github.com/aryarajsingh/myntra-verdict",
};
