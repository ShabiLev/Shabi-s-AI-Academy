import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { useAosSnapshot } from "../../aos/useAosSnapshot";
import { aosUi } from "../../aos/aosUiText";

export function AosHandoffsPage() {
  const { language } = useLanguage();
  const ui = language === "he" ? "he" : "en";
  const s = aosUi[ui];
  const result = useAosSnapshot();

  return (
    <div className="page aos-handoffs-page">
      <div className="page-heading">
        <h1>{s.handoffHeading}</h1>
        <Link to="/aos">{s.backToDashboard}</Link>
      </div>

      {result.kind === "notGenerated" && <p>{s.notGeneratedBody}</p>}

      {result.kind === "ok" && (
        <section className="settings-card" aria-labelledby="aos-handoff-status">
          <h2 id="aos-handoff-status">
            {result.snapshot.activeHandoff ? String(result.snapshot.activeHandoff) : s.handoffNone}
          </h2>
          <p>
            {ui === "he"
              ? "מסירה נדרשת לפי .agent/handoff/handoff-policy.md כאשר סוכן עוצר לפני סיום המשימה. כל מסמך מסירה כולל: משימה, היקף, ענף, קומיט התחלתי, קומיט אחרון, קבצים שהשתנו, בדיקות שהורצו, נתיב ראיות, כשלים פתוחים, אזהרות, ביקורת ידנית, פעולה הבאה, והנחות אסורות."
              : "A handoff is required per .agent/handoff/handoff-policy.md whenever an agent stops before a task is finished. Every handoff document includes: task, scope, branch, starting commit, latest commit, files changed, tests executed, evidence path, open failures, warnings, manual review, next action, and prohibited assumptions."}
          </p>
        </section>
      )}
    </div>
  );
}
