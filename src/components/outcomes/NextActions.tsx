import { useId } from "react";
import type { OutcomeAction, OutcomeLanguage } from "./types";

const copy = { he: { heading: "הצעדים הבאים", recommended: "מומלץ" }, en: { heading: "Next actions", recommended: "Recommended" } };

export function NextActions({ language, actions, recommendedId }: { language: OutcomeLanguage; actions: OutcomeAction[]; recommendedId?: string }) {
  const headingId = useId();
  if (!actions.length) return null;
  return (
    <section className="outcome-next-actions" aria-labelledby={headingId}>
      <h2 id={headingId}>{copy[language].heading}</h2>
      <ol>{actions.map((action) => <li key={action.id}>
        <div>{recommendedId === action.id ? <strong className="outcome-recommended">{copy[language].recommended}</strong> : null}{action.description ? <p>{action.description[language]}</p> : null}</div>
        {action.href && !action.disabled ? <a href={action.href}>{action.label[language]}</a> : <button type="button" disabled={action.disabled} onClick={action.onSelect}>{action.label[language]}</button>}
      </li>)}</ol>
    </section>
  );
}
