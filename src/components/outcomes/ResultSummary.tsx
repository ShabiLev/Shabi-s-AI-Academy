import { useEffect, useId, useRef, type ReactNode } from "react";
import type { LocalizedOutcomeText, OutcomeLanguage, OutcomeReference } from "./types";

interface ResultSummaryProps {
  language: OutcomeLanguage;
  title: LocalizedOutcomeText;
  summary: LocalizedOutcomeText;
  location?: LocalizedOutcomeText;
  references?: OutcomeReference[];
  statusMessage?: LocalizedOutcomeText;
  focusOnMount?: boolean;
  children?: ReactNode;
}

const copy = {
  he: { heading: "סיכום תוצאה", location: "מיקום שמירה", references: "פריטים קשורים" },
  en: { heading: "Result summary", location: "Saved in", references: "Related items" },
};

export function ResultSummary({ language, title, summary, location, references = [], statusMessage, focusOnMount = false, children }: ResultSummaryProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus();
  }, [focusOnMount]);

  return (
    <section className="outcome-result-summary" aria-labelledby={headingId}>
      <p className="eyebrow">{copy[language].heading}</p>
      <h1 id={headingId} ref={headingRef} tabIndex={focusOnMount ? -1 : undefined}>{title[language]}</h1>
      <p className="outcome-result-description">{summary[language]}</p>
      {location ? <p><strong>{copy[language].location}:</strong> {location[language]}</p> : null}
      {references.length ? (
        <div className="outcome-references">
          <h2>{copy[language].references}</h2>
          <ul>{references.map((reference) => <li key={`${reference.id}:${reference.href ?? "reference"}`}>{reference.href ? <a href={reference.href}>{reference.label[language]}</a> : reference.label[language]}</li>)}</ul>
        </div>
      ) : null}
      {children}
      <p className="sr-only" aria-live="polite" aria-atomic="true">{statusMessage?.[language] ?? ""}</p>
    </section>
  );
}
