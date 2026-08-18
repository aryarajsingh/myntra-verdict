"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SURVEY_ITEMS, SURVEY_META } from "@/data/survey";
import { LINKS } from "@/lib/links";

type Answers = Record<string, string | string[] | number>;

const QUESTIONS = SURVEY_ITEMS.filter((i) => i.type !== "section");

export function SurveyForm() {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState<"ok" | "out" | null>(null);
  const q = QUESTIONS[i];
  const value = answers[q?.id];
  const filled =
    q?.type === "multi" ? Array.isArray(value) && value.length > 0 : value !== undefined && value !== "";

  const sections = useMemo(() => [...new Set(QUESTIONS.map((x) => x.section))], []);

  function setVal(v: string | string[] | number) {
    setAnswers((a) => ({ ...a, [q.id]: v }));
  }

  function next() {
    if (q.id === "S1" && answers.S1 === "No") {
      setDone("out");
      return;
    }
    if (q.id === "S5" && answers.S5 === "0") {
      setDone("out");
      return;
    }
    if (i >= QUESTIONS.length - 1) {
      setDone("ok");
      return;
    }
    setI((n) => n + 1);
  }

  if (done) {
    return (
      <div className="hub">
        <p className="hub-kicker">Research · questionnaire</p>
        <h1 className="display sm">{done === "ok" ? "That’s the question set." : "This isn’t for you to take."}</h1>
        <p className="hub-lede">
          {done === "ok"
            ? "Submitting here doesn’t write to the workbook. The 48 responses I used are in the xlsx."
            : "Thanks. The survey universe is people who use Myntra and have items sitting in wishlist."}
        </p>
        <div className="path-ctas" style={{ marginTop: 8 }}>
          <Link href="/research/" className="primary">
            Back to Research
          </Link>
          <a href={LINKS.surveyXlsx} className="secondary">
            Workbook
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="hub">
      <p className="hub-kicker">Research · questionnaire · {SURVEY_META.minutes} min · {q.section}</p>
      <h1 className="display sm">The questions I used</h1>
      <p className="hub-lede">
        You don’t need to fill this. It’s here so the questionnaire has a URL. Answers I used are in the workbook.
        Think of one item on a Myntra wishlist only if you actually want to click through.
      </p>
      <p className="muted" style={{ marginTop: 12 }}>
        {i + 1} / {QUESTIONS.length} · {sections.length} sections ·{" "}
        <Link href="/research/">Skip to Research</Link>
        {" · "}
        <Link href="/survey/">Questions list</Link>
      </p>

      <section className="brief-q" style={{ marginTop: 24 }}>
        <h2>
          {q.id}. {q.title}
        </h2>
        {q.help ? <p className="muted">{q.help}</p> : null}

        {q.options && (q.type === "mcq" || q.type === "dropdown") ? (
          <div style={{ marginTop: 12 }}>
            {q.options.map((o) => (
              <button
                key={o}
                type="button"
                className={`radio-row ${value === o ? "selected" : ""}`}
                onClick={() => setVal(o)}
              >
                {o}
              </button>
            ))}
          </div>
        ) : null}

        {q.type === "multi" && q.options ? (
          <div style={{ marginTop: 12 }}>
            {q.options.map((o) => {
              const sel = Array.isArray(value) && value.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  className={`radio-row ${sel ? "selected" : ""}`}
                  onClick={() => {
                    const cur = Array.isArray(value) ? value : [];
                    setVal(sel ? cur.filter((x) => x !== o) : [...cur, o]);
                  }}
                >
                  {o}
                </button>
              );
            })}
          </div>
        ) : null}

        {q.type === "scale" && q.scale ? (
          <div className="size-row" style={{ marginTop: 12 }}>
            {Array.from({ length: q.scale.max - q.scale.min + 1 }, (_, n) => q.scale!.min + n).map((n) => (
              <button key={n} type="button" className={`size-btn ${value === n ? "selected" : ""}`} onClick={() => setVal(n)}>
                {n}
              </button>
            ))}
          </div>
        ) : null}

        {q.type === "scale" && q.scale ? (
          <p className="muted" style={{ marginTop: 8 }}>
            {q.scale.min} = {q.scale.minLabel} · {q.scale.max} = {q.scale.maxLabel}
          </p>
        ) : null}

        {q.type === "long" ? (
          <textarea
            rows={4}
            style={{ width: "100%", marginTop: 12, padding: 8 }}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Optional"
          />
        ) : null}
      </section>

      <div className="path-ctas" style={{ marginTop: 20 }}>
        <button className="secondary" type="button" disabled={i === 0} onClick={() => setI((n) => n - 1)}>
          Back
        </button>
        <button className="primary" type="button" disabled={q.required && q.type !== "long" && !filled} onClick={next}>
          {i === QUESTIONS.length - 1 ? "Submit" : "Continue"}
        </button>
      </div>
    </div>
  );
}
