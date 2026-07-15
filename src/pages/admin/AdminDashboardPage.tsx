import { Link } from "react-router-dom";
import { useAosSnapshot } from "../../aos/useAosSnapshot";
import { useLanguage } from "../../i18n/LanguageContext";

export function AdminDashboardPage() {
  const { language } = useLanguage(); const he = language === "he"; const aos = useAosSnapshot();
  return <div className="page admin-page">
    <section className="panel"><h2>{he ? "ניהול לקריאה בלבד" : "Read-only administration"}</h2><p>{he ? "ההרשאה אומתה מטביעת תפקיד מאובטחת. פעולות כתיבה אינן זמינות בגרסה זו." : "Authorization came from a trusted role claim. Administrative writes are unavailable in this release."}</p><div className="admin-links"><Link to="/admin/users">{he ? "משתמשים" : "Users"}</Link><Link to="/admin/content">{he ? "תוכן" : "Content"}</Link><Link to="/admin/audit">{he ? "ביקורת מערכת" : "System audit"}</Link></div></section>
    {aos.kind === "ok" && <section className="panel" aria-labelledby="admin-aos-progress"><h2 id="admin-aos-progress">{he ? "מצב AOS" : "AOS status"}</h2><dl className="qa-header-grid"><div><dt>{he ? "גרסה" : "Version"}</dt><dd><bdi dir="ltr">{aos.snapshot.applicationVersion}</bdi></dd></div><div><dt>{he ? "מצב שחרור" : "Release state"}</dt><dd>{aos.snapshot.memory.releaseState}</dd></div><div><dt>{he ? "התקדמות" : "Progress"}</dt><dd>{aos.snapshot.memory.completionPercent}%</dd></div><div><dt>{he ? "חסמים" : "Blockers"}</dt><dd>{aos.snapshot.memory.blockerCount}</dd></div></dl><p>{he ? "משימה" : "Task"}: {aos.snapshot.memory.currentTask ?? "—"}</p><p>{he ? "פעולה הבאה" : "Next action"}: {aos.snapshot.memory.nextAction ?? "—"}</p><p>{he ? "ראיות" : "Evidence"}: {aos.snapshot.memory.evidenceCurrent ? (he ? "עדכניות" : "Current") : (he ? "נדרש אימות מחדש" : "Rerun required")}</p><Link to="/aos/progress">{he ? "לפרטי ההתקדמות" : "View progress"}</Link></section>}
  </div>;
}
