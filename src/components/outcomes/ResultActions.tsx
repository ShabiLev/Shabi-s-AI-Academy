import { useId } from "react";
import type { OutcomeAction, OutcomeLanguage } from "./types";

const heading = { he: "פעולות לתוצאה", en: "Result actions" };

function Action({ action, language, descriptionId }: { action: OutcomeAction; language: OutcomeLanguage; descriptionId?: string }) {
  const contents = <>{action.leadingIcon ? <span aria-hidden="true">{action.leadingIcon}</span> : null}<span>{action.label[language]}</span></>;
  if (action.href && !action.disabled) return <a className="outcome-action" href={action.href}>{contents}</a>;
  return <button className="outcome-action" type="button" disabled={action.disabled} onClick={action.onSelect} aria-describedby={descriptionId}>{contents}</button>;
}

export function ResultActions({ language, actions, label }: { language: OutcomeLanguage; actions: OutcomeAction[]; label?: string }) {
  const descriptionBaseId = useId();
  if (!actions.length) return null;
  return (
    <nav className="outcome-result-actions" aria-label={label ?? heading[language]}>
      {actions.map((action, index) => {
        const descriptionId = action.description ? `${descriptionBaseId}-${index}` : undefined;
        return (
        <div className="outcome-action-item" key={action.id}>
          <Action action={action} language={language} descriptionId={descriptionId} />
          {action.description ? <small id={descriptionId}>{action.description[language]}</small> : null}
        </div>
      );})}
    </nav>
  );
}
