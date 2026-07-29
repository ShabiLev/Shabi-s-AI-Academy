import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { useMissions } from "../missions";

const statusText: Record<string, { he: string; en: string }> = {
  draft: { he: "טיוטה", en: "Draft" },
  "awaiting-plan-approval": { he: "ממתינה לאישור תכנית", en: "Awaiting plan approval" },
  ready: { he: "מוכנה", en: "Ready" },
  running: { he: "פועלת", en: "Running" },
  paused: { he: "מושהית", en: "Paused" },
  "needs-input": { he: "נדרש קלט", en: "Needs input" },
  "needs-work": { he: "נדרשת עבודה", en: "Needs work" },
  completed: { he: "הושלמה", en: "Completed" },
  cancelled: { he: "בוטלה", en: "Cancelled" },
  blocked: { he: "חסומה", en: "Blocked" },
};

export function MissionsPage() {
  const { language } = useLanguage();
  const { missions, recoveredDomains } = useMissions();
  const he = language === "he";
  return <div className="page mission-list-page" data-testid="missions-page">
    <header className="page-heading">
      <div><p className="eyebrow">{he ? "סביבת צוותים מוסברת" : "Explainable team workspace"}</p><h1>{he ? "משימות" : "Missions"}</h1><p>{he ? "הפכו מטרה לתכנית, צוות, ראיות ולמידה — ללא אוטונומיה לא מבוקרת." : "Turn a goal into a plan, team, evidence, and learning — without unrestricted autonomy."}</p></div>
      <Link className="button primary-button" to="/missions/new">{he ? "משימה חדשה" : "New mission"}</Link>
    </header>
    {recoveredDomains.length > 0 && <div className="mission-alert" role="status"><strong>{he ? "בוצע שחזור בטוח" : "Safe recovery applied"}</strong><span>{he ? "נתון פגום הועבר להסגר והתחום נפתח ריק." : "Malformed data was quarantined and the domain opened empty."}</span></div>}
    {missions.length === 0 ? <section className="mission-empty"><h2>{he ? "עדיין אין משימות" : "No missions yet"}</h2><p>{he ? "התחילו במטרה קצרה; המנצח יציע תכנית וצוות לפני כל פעולה." : "Start with a short goal; the Conductor proposes a plan and team before any action."}</p><Link to="/missions/new">{he ? "בניית המשימה הראשונה" : "Build the first mission"}</Link></section>
      : <section className="mission-card-grid" aria-label={he ? "רשימת משימות" : "Mission list"}>{[...missions].reverse().map((mission) => <article className="mission-card" key={mission.id}>
        <span className={`mission-status mission-status-${mission.status}`}>{statusText[mission.status]?.[language] ?? mission.status}</span>
        <h2>{mission.title}</h2>
        <p>{mission.interpretation.summary[language]}</p>
        <dl><div><dt>{he ? "מצב הדרכה" : "Guidance"}</dt><dd>{mission.guidanceMode}</dd></div><div><dt>{he ? "רמת הרצה" : "Execution"}</dt><dd>{mission.executionLevel}</dd></div></dl>
        <Link to={`/missions/${mission.id}`}>{mission.status === "paused" ? (he ? "המשך בטוח" : "Safe continue") : (he ? "פתיחת סביבת העבודה" : "Open workspace")}</Link>
      </article>)}</section>}
  </div>;
}
