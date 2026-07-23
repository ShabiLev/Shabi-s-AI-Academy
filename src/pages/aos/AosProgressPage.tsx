import { Link } from "react-router-dom";
import { useAosSnapshot } from "../../aos/useAosSnapshot";
import { useLanguage } from "../../i18n/LanguageContext";

const copy = {
  he: { title: "התקדמות AOS", task: "משימה נוכחית", phase: "שלב נוכחי", release: "מצב שחרור", completion: "השלמה", completed: "דרישות שהושלמו", remaining: "דרישות חלקיות או חסרות", blockers: "חסמים", none: "אין חסמים מתועדים", actions: "הפעולות הבאות", back: "חזרה ללוח הבקרה", unavailable: "טרם נוצרה תמונת מצב" },
  en: { title: "AOS progress", task: "Current task", phase: "Current phase", release: "Release state", completion: "Completion", completed: "Completed requirements", remaining: "Partial or missing requirements", blockers: "Blockers", none: "No recorded blockers", actions: "Next actions", back: "Back to dashboard", unavailable: "No snapshot generated yet" },
} as const;

export function AosProgressPage() {
  const { language } = useLanguage(); const s = copy[language === "he" ? "he" : "en"];
  const result = useAosSnapshot();
  if (result.kind !== "ok" || !result.snapshot.memory.available) return <div className="page"><p role="status">{result.kind === "loading" ? "…" : s.unavailable}</p></div>;
  const memory = result.snapshot.memory;
  const remaining = memory.requirements.partial + memory.requirements.missing;
  return <div className="page aos-page">
    <div className="page-heading"><h1>{s.title}</h1><p>{s.task}: {memory.currentTask ?? "—"}</p></div>
    <section className="settings-card" aria-labelledby="aos-progress-status"><h2 id="aos-progress-status">{s.completion}: {memory.completionPercent}%</h2><progress max="100" value={memory.completionPercent}>{memory.completionPercent}%</progress><dl className="qa-header-grid"><div><dt>{s.phase}</dt><dd>{memory.currentPhase ?? "—"}</dd></div><div><dt>{s.release}</dt><dd>{memory.releaseState}</dd></div><div><dt>{s.completed}</dt><dd>{memory.requirements.completed}</dd></div><div><dt>{s.remaining}</dt><dd>{remaining}</dd></div></dl></section>
    <section className="settings-card"><h2>{s.blockers}</h2>{memory.blockers.length ? <ul>{memory.blockers.map((item) => <li key={item}>{item}</li>)}</ul> : <p>{s.none}</p>}</section>
    <section className="settings-card"><h2>{s.actions}</h2><ol>{memory.nextActions.map((action) => <li key={action.id}><bdi dir="ltr" className="aos-technical">{action.id}</bdi>: {action.title} ({action.priority})</li>)}</ol></section>
    <Link to="/aos">{s.back}</Link>
  </div>;
}
