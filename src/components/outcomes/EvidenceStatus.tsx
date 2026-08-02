import { useId } from "react";
import type { LocalizedOutcomeText, OutcomeLanguage, OutcomeReference } from "./types";

export type EvidenceState = "verified" | "needsEvidence" | "notVerified" | "blocked";

const text: Record<OutcomeLanguage, { heading: string; states: Record<EvidenceState, string>; count: (value: number) => string }> = {
  he: { heading: "מצב ראיות", states: { verified: "אומת באמצעות ראיות", needsEvidence: "נדרשות ראיות", notVerified: "לא אומת", blocked: "חסום" }, count: (value) => `${value} פריטי ראיה` },
  en: { heading: "Evidence status", states: { verified: "Verified with evidence", needsEvidence: "Evidence required", notVerified: "Not verified", blocked: "Blocked" }, count: (value) => `${value} evidence item${value === 1 ? "" : "s"}` },
};

interface EvidenceStatusProps {
  language: OutcomeLanguage;
  state: EvidenceState;
  evidence?: OutcomeReference[];
  explanation?: LocalizedOutcomeText;
}

export function EvidenceStatus({ language, state, evidence = [], explanation }: EvidenceStatusProps) {
  const headingId = useId();
  const effectiveState: EvidenceState = state === "verified" && evidence.length === 0 ? "needsEvidence" : state;
  return (
    <section className={`outcome-evidence-status outcome-evidence-${effectiveState}`} aria-labelledby={headingId}>
      <h2 id={headingId}>{text[language].heading}</h2>
      <p><strong>{text[language].states[effectiveState]}</strong></p>
      {explanation ? <p>{explanation[language]}</p> : null}
      {evidence.length ? <><p>{text[language].count(evidence.length)}</p><ul>{evidence.map((item) => <li key={item.id}>{item.href ? <a href={item.href}>{item.label[language]}</a> : item.label[language]}</li>)}</ul></> : null}
    </section>
  );
}
