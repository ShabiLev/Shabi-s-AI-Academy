import { useId } from "react";
import type { LocalizedOutcomeText, OutcomeLanguage } from "./types";

const heading = { he: "מגבלות שחשוב להכיר", en: "Important limitations" };

export function LimitationsPanel({ language, limitations }: { language: OutcomeLanguage; limitations: LocalizedOutcomeText[] }) {
  const headingId = useId();
  if (!limitations.length) return null;
  return <aside className="outcome-limitations" aria-labelledby={headingId}><h2 id={headingId}>{heading[language]}</h2><ul>{limitations.map((item, index) => <li key={`${index}:${item.en}`}>{item[language]}</li>)}</ul></aside>;
}
