"use client";

import Link from "next/link";
import { artefacts } from "@/lib/artefacts";

function fileHref(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`;
}

function isFile(href: string) {
  return /\.[a-z0-9]+$/i.test(href.split("?")[0] ?? "");
}

export function ArtefactsApp() {
  const rows = artefacts();

  return (
    <div className="hub">
      <p className="hub-kicker">Files</p>
      <h1 className="display sm">Supporting files</h1>
      <p className="hub-lede">
        Submit the home URL. Live model, product, research, and the PDF are on that site. This list is the rest:
        interviews, notes, extract prompt, questionnaire URL, workbook.
      </p>

      <ol className="docs-list">
        {rows.map((a) => {
          const inner = (
            <>
              <span className="docs-id">{a.id}</span>
              <span>
                <span className="docs-part">{a.part}</span>
                <strong>{a.title}</strong>
                <span className="docs-body">{a.body}</span>
              </span>
              <span className="docs-kind">{a.kind}</span>
            </>
          );
          const file = Boolean(a.href) && isFile(a.href);
          return (
            <li key={a.id}>
              {a.href ? (
                a.href.startsWith("http") || file ? (
                  <a href={file ? fileHref(a.href) : a.href} className="docs-row">
                    {inner}
                  </a>
                ) : (
                  <Link href={a.href} className="docs-row">
                    {inner}
                  </Link>
                )
              ) : (
                <div className="docs-row is-slot">{inner}</div>
              )}
            </li>
          );
        })}
      </ol>

      <p className="hub-aside">
        Questionnaire (optional): <Link href="/survey/form/">click through</Link>
        {" · "}
        Workbook:{" "}
        <a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/survey/Wishlist-survey-workbook.xlsx`}>xlsx</a>
        {" · "}
        Interviews: <Link href="/research/">six people</Link>
      </p>
    </div>
  );
}
