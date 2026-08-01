import { useState } from "react";
import { Link } from "react-router-dom";
import type { EvaluationCompetitorResult, EvaluationEvidence, TraceEvent } from "../../evaluations";
import type { EvaluationLanguage } from "../../evaluations/uiText";
import { EvaluationBadge } from "./EvaluationBadge";

type FilterKey = "phase" | "actor" | "result" | "permission" | "retry" | "evidenceType";
const label = (value: string, he: boolean) => he ? ({ freeze: "הקפאה", evaluate: "הערכה", publish: "פרסום", "read-only": "קריאה בלבד", PASS: "עבר", FAIL: "נכשל", INFO: "מידע", pass: "עבר", fail: "נכשל", partial: "חלקי", "not-scored": "לא ניתן לניקוד", requirement: "דרישה", output: "פלט", test: "בדיקה", accessibility: "נגישות", security: "אבטחה", performance: "ביצועים", trace: "עקבות", review: "סקירה", "independent-evaluator-panel": "צוות מעריכים עצמאיים", "academy-simulator": "סימולטור Academy" }[value] ?? "ערך מקומי") : value;

export function TraceTimeline({ language, events, results = [], evidence = [], evaluationId }: { language: EvaluationLanguage; events: readonly TraceEvent[]; results?: readonly EvaluationCompetitorResult[]; evidence?: readonly EvaluationEvidence[]; evaluationId?: string }) {
  const [filters, setFilters] = useState<Record<FilterKey, string>>({ phase: "all", actor: "all", result: "all", permission: "all", retry: "all", evidenceType: "all" });
  const [visibleLimit, setVisibleLimit] = useState(25);
  const he = language === "he";
  const values = (select: (event: TraceEvent) => string | undefined) => [...new Set(events.map(select).filter((value): value is string => Boolean(value)))];
  const options: Array<{ key: FilterKey; he: string; en: string; values: string[] }> = [
    { key: "phase", he: "סינון לפי שלב", en: "Filter by phase", values: values((event) => event.metadata.phase) },
    { key: "actor", he: "סוכן או מעריך", en: "Agent or evaluator", values: values((event) => event.actorId) },
    { key: "result", he: "סטטוס ממצא בתוצאה", en: "Finding status in result", values: ["pass", "fail", "partial", "not-scored"] },
    { key: "permission", he: "הרשאה", en: "Permission", values: values((event) => event.metadata.permission) },
    { key: "retry", he: "חזרה", en: "Retry", values: values((event) => event.metadata.retry?.toString()) },
    { key: "evidenceType", he: "סוג ראיה", en: "Evidence type", values: [...new Set(events.flatMap((event) => event.metadata.evidenceTypes ?? (event.metadata.evidenceType ? [event.metadata.evidenceType] : [])))] },
  ];
  const visible = events.filter((event) =>
    (filters.phase === "all" || event.metadata.phase === filters.phase)
    && (filters.actor === "all" || event.actorId === filters.actor)
    && (filters.result === "all" || results.some((result) => result.id === event.metadata.resultId && result.findings.some((finding) => finding.status === filters.result)))
    && (filters.permission === "all" || event.metadata.permission === filters.permission)
    && (filters.retry === "all" || event.metadata.retry?.toString() === filters.retry)
    && (filters.evidenceType === "all" || (event.metadata.evidenceTypes ?? (event.metadata.evidenceType ? [event.metadata.evidenceType] : [])).includes(filters.evidenceType as EvaluationEvidence["type"])));
  const shown = visible.slice(0, visibleLimit);
  return (
    <section className="evaluation-panel" aria-labelledby="trace-heading">
      <div className="evaluation-section-heading">
        <div><p className="eyebrow">{he ? "ללא chain-of-thought פרטי" : "No private chain-of-thought"}</p><h2 id="trace-heading">{he ? "עקבות הרצה בטוחים" : "Safe run trace"}</h2></div>
        <EvaluationBadge tone={events.some((event) => event.metadata.gateStatus === "FAIL") ? "warning" : "positive"}>{events.length} {he ? "אירועים שמורים" : "saved events"}</EvaluationBadge>
      </div>
      <div className="evaluation-inline-fields">{options.map((option) => <label className="evaluation-filter" key={option.key}>{he ? option.he : option.en}<select value={filters[option.key]} onChange={(event) => setFilters((current) => ({ ...current, [option.key]: event.target.value }))}><option value="all">{he ? "הכול" : "All"}</option>{option.values.map((value) => <option value={value} key={value}>{label(value, he)}</option>)}</select></label>)}</div>
      <p className="sr-only" aria-live="polite">{he ? `${shown.length} מתוך ${visible.length} אירועים מוצגים` : `${shown.length} of ${visible.length} events shown`}</p>
      <ol className="evaluation-trace-list">
        {shown.map((event) => (
          <li key={event.id}>
            <span className="evaluation-sequence" aria-hidden="true">{event.sequence}</span>
            <div>
              <div className="evaluation-trace-meta"><strong>{event.actorType === "evaluator" ? (he ? "מעריך עצמאי" : "Independent evaluator") : (he ? "מערכת Academy" : "Academy system")}</strong><EvaluationBadge tone={event.metadata.gateStatus === "FAIL" ? "warning" : "positive"}>{label(event.metadata.gateStatus ?? "INFO", he)}</EvaluationBadge></div>
              <p>{event.summary[language]}</p>
              <small>{he ? `שלב ${label(event.metadata.phase ?? event.eventType, true)} · ${event.evidenceIds.length} הפניות לראיות · הרשאה: ${label(event.metadata.permission ?? "read-only", true)}` : `${event.metadata.phase ?? event.eventType} phase · ${event.evidenceIds.length} evidence references · permission: ${event.metadata.permission ?? "read-only"}`}</small>
              {event.evidenceIds.length > 0 ? <details><summary>{he ? "הצגת פרטי ראיות" : "Show evidence details"}</summary><ul>{event.evidenceIds.map((id) => { const item = evidence.find((candidate) => candidate.id === id); return <li key={id}>{evaluationId ? <Link to={`/evaluations/${evaluationId}/results#evidence-${id}`}><code>{id}</code></Link> : <code>{id}</code>}{item ? <> · {item.summary[language]} · <code>{item.contentHash}</code></> : null}</li>; })}</ul></details> : null}
            </div>
          </li>
        ))}
      </ol>
      {visible.length > visibleLimit ? <button type="button" onClick={() => setVisibleLimit((value) => value + 25)}>{he ? "טעינת אירועים נוספים" : "Load more events"}</button> : null}
    </section>
  );
}
