import { useState } from "react";
import type { TraceEvent } from "../../evaluations";
import type { EvaluationLanguage } from "../../evaluations/uiText";
import { EvaluationBadge } from "./EvaluationBadge";

export function TraceTimeline({ language, events }: { language: EvaluationLanguage; events: readonly TraceEvent[] }) {
  const [filter, setFilter] = useState("all");
  const he = language === "he";
  const phases = [...new Set(events.map((event) => event.metadata.phase).filter((phase): phase is string => Boolean(phase)))];
  const visible = filter === "all" ? events : events.filter((event) => event.metadata.phase === filter);
  return (
    <section className="evaluation-panel" aria-labelledby="trace-heading">
      <div className="evaluation-section-heading">
        <div><p className="eyebrow">{he ? "ללא chain-of-thought פרטי" : "No private chain-of-thought"}</p><h2 id="trace-heading">{he ? "עקבות הרצה בטוחים" : "Safe run trace"}</h2></div>
        <EvaluationBadge tone={events.some((event) => event.metadata.gateStatus === "FAIL") ? "warning" : "positive"}>{events.length} {he ? "אירועים שמורים" : "saved events"}</EvaluationBadge>
      </div>
      <label className="evaluation-filter">
        {he ? "סינון לפי שלב" : "Filter by phase"}
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">{he ? "כל השלבים" : "All phases"}</option>
          {phases.map((phase) => <option value={phase} key={phase}>{phase}</option>)}
        </select>
      </label>
      <p className="sr-only" aria-live="polite">{he ? `${visible.length} אירועים מוצגים` : `${visible.length} events shown`}</p>
      <ol className="evaluation-trace-list">
        {visible.map((event) => (
          <li key={event.sequence}>
            <span className="evaluation-sequence" aria-hidden="true">{event.sequence}</span>
            <div>
              <div className="evaluation-trace-meta">
                <strong>{event.actorType === "evaluator" ? (he ? "מעריך עצמאי" : "Independent evaluator") : (he ? "מערכת Academy" : "Academy system")}</strong>
                <EvaluationBadge tone={event.metadata.gateStatus === "FAIL" ? "warning" : "positive"}>{event.metadata.gateStatus ?? "INFO"}</EvaluationBadge>
              </div>
              <p>{event.summary[language]}</p>
              <small>{he ? `שלב ${event.metadata.phase ?? event.eventType} · ${event.evidenceIds.length} הפניות לראיות · הרשאה: ${event.metadata.permission ?? "קריאה בלבד"}` : `${event.metadata.phase ?? event.eventType} phase · ${event.evidenceIds.length} evidence references · permission: ${event.metadata.permission ?? "read-only"}`}</small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
