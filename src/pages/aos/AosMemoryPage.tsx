import { Link } from "react-router-dom";
import { useAosSnapshot } from "../../aos/useAosSnapshot";
import { useLanguage } from "../../i18n/LanguageContext";

const copy = {
  he: { title: "זיכרון הסוכנים", freshness: "עדכניות הזיכרון", task: "משימה נוכחית", phase: "שלב נוכחי", evidence: "ראיות אחרונות", current: "הראיות תואמות לקומיט הנוכחי", stale: "הראיות אינן תואמות למצב הנוכחי", issues: "בעיות ידועות", research: "מחקר", sources: "מקורות", candidates: "מועמדים לבדיקה", published: "פורסמו", handoff: "מסירה אחרונה", none: "אין מסירה פעילה", back: "חזרה ללוח הבקרה", unavailable: "טרם נוצרה תמונת מצב" },
  en: { title: "Agent memory", freshness: "Memory freshness", task: "Current task", phase: "Current phase", evidence: "Latest evidence", current: "Evidence matches the current commit", stale: "Evidence does not match the current working state", issues: "Known issues", research: "Research", sources: "Sources", candidates: "Candidates pending review", published: "Published", handoff: "Latest handoff", none: "No active handoff", back: "Back to dashboard", unavailable: "No snapshot generated yet" },
} as const;

export function AosMemoryPage() {
  const { language } = useLanguage(); const s = copy[language === "he" ? "he" : "en"];
  const result = useAosSnapshot();
  if (result.kind !== "ok") return <div className="page"><p role="status">{result.kind === "loading" ? "…" : s.unavailable}</p></div>;
  const memory = result.snapshot.memory;
  return <div className="page aos-page"><div className="page-heading"><h1>{s.title}</h1><p>{s.freshness}: {memory.updatedAt ? new Date(memory.updatedAt).toLocaleString(language === "he" ? "he-IL" : "en-US") : "—"}</p></div><section className="settings-card"><h2>{s.task}</h2><p>{memory.currentTask ?? "—"}</p><p>{s.phase}: {memory.currentPhase ?? "—"}</p></section><section className="settings-card"><h2>{s.evidence}</h2><p><bdi dir="ltr" className="aos-technical">{memory.latestEvidenceRunId ?? "—"}</bdi></p><p className={`qa-status-badge ${memory.evidenceCurrent ? "qa-status-gate-passed" : "qa-status-gate-warning"}`}>{memory.evidenceCurrent ? s.current : s.stale}</p></section><section className="settings-card"><h2>{s.issues}</h2><p>{memory.knownIssueCount}</p><h3>{s.research}</h3><p>{s.sources}: {memory.research.sources}; {s.candidates}: {memory.research.candidatesPendingReview}; {s.published}: {memory.research.publishedItems}</p></section><section className="settings-card"><h2>{s.handoff}</h2><p>{memory.handoff.summary ?? s.none}</p></section><Link to="/aos">{s.back}</Link></div>;
}
