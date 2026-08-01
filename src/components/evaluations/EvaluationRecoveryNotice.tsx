import { Link } from "react-router-dom";
import { useEvaluations, type EvaluationDomain } from "../../evaluations";
import type { EvaluationLanguage } from "../../evaluations/uiText";

export function EvaluationRecoveryNotice({ language }: { language: EvaluationLanguage }) {
  const evaluations = useEvaluations();
  const recovered = evaluations.snapshot.recoveredDomains as EvaluationDomain[];
  if (recovered.length === 0) return null;
  const he = language === "he";
  const domainLabel = (domain: EvaluationDomain) => he ? ({ rubrics: "מחוונים", experiments: "ניסויים", runs: "הרצות", suites: "סדרות רגרסיה", failures: "מקרי כשל", versions: "גרסאות", previews: "טיוטות חיבור", evidence: "ראיות", traces: "עקבות" }[domain]) : domain;
  return (
    <section className="evaluation-alert" role="alert" aria-labelledby="evaluation-recovery-title">
      <h2 id="evaluation-recovery-title">{he ? "נתוני הערכה פגומים הועברו להסגר" : "Corrupt evaluation data was quarantined"}</h2>
      <p>{he ? "התוכן הפגום לא נטען. ניתן לשחזר מגיבוי או לאפס רק את התחומים המושפעים." : "Unsafe content was not loaded. Restore a backup or reset only the affected domains."}</p>
      <p><strong>{he ? "תחומים:" : "Domains:"}</strong> {recovered.map(domainLabel).join(", ")}</p>
      <div className="evaluation-run-actions">
        <Link to="/settings">{he ? "פתיחת שחזור מגיבוי" : "Open backup restore"}</Link>
        {recovered.map((domain) => <button type="button" key={domain} onClick={() => evaluations.resetRecoveredDomain(domain)}>{he ? `איפוס ${domainLabel(domain)}${["runs", "evidence", "traces"].includes(domain) ? " והגרף המקושר" : ""}` : `Reset ${domain}${["runs", "evidence", "traces"].includes(domain) ? " and its linked graph" : ""}`}</button>)}
      </div>
    </section>
  );
}
