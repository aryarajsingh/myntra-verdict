"use client";

import Link from "next/link";
import { SURVEY_ITEMS, SURVEY_STATS } from "@/data/survey";
import { LINKS } from "@/lib/links";

function TypeTag({ t }: { t: string }) {
  if (t === "section") return null;
  const label =
    t === "mcq"
      ? "Single choice"
      : t === "multi"
        ? "Multi-select"
        : t === "scale"
          ? "Scale 1–5"
          : t === "dropdown"
            ? "Dropdown"
            : t === "long"
              ? "Paragraph"
              : "Short text";
  return <span className="type-tag">{label}</span>;
}

export function SurveyApp() {
  const sections = [...new Set(SURVEY_ITEMS.map((i) => i.section))];

  return (
    <div className="hub">
      <p className="hub-kicker">Survey</p>
      <h1 className="display sm">The questions. Counts are on Research.</h1>
      <p className="hub-lede">
        {SURVEY_STATS.n} rows ({SURVEY_STATS.inTarget} in-target). Same eight prompts as the interviews. Charts and the
        takeaway are on <Link href="/research/">Research</Link>. You don’t need to fill anything — the answers are in
        the workbook.
      </p>
      <div className="path-ctas" style={{ marginTop: 8 }}>
        <a href={LINKS.surveyXlsx} className="primary">
          Download workbook (xlsx)
        </a>
        <Link href="/survey/form/" className="secondary">
          Click through the questions
        </Link>
      </div>

      <h2 className="hub-sec">The questions</h2>
      <p>
        Listed here so you can read them. Submitting the form doesn’t add to the workbook.
      </p>
      {sections.map((sec) => (
        <section key={sec} className="brief-q">
          <p className="hub-kicker">{sec}</p>
          {SURVEY_ITEMS.filter((i) => i.section === sec).map((q) => (
            <div key={q.id} className="survey-q">
              {q.type === "section" ? (
                <p>{q.title}</p>
              ) : (
                <>
                  <h3>
                    {q.id}. {q.title} <TypeTag t={q.type} />
                    {q.required ? <span className="req">Required</span> : <span className="muted"> Optional</span>}
                  </h3>
                  {q.help ? <p className="muted">{q.help}</p> : null}
                  {q.options ? (
                    <ul>
                      {q.options.map((o) => (
                        <li key={o}>{o}</li>
                      ))}
                    </ul>
                  ) : null}
                  {q.scale ? (
                    <p className="muted">
                      {q.scale.min} = {q.scale.minLabel} · {q.scale.max} = {q.scale.maxLabel}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
