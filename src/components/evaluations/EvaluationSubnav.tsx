import { Link } from "react-router-dom";
import type { EvaluationLanguage } from "../../evaluations/uiText";

export function EvaluationSubnav({
  language,
  evaluationPath,
  current,
}: {
  language: EvaluationLanguage;
  evaluationPath?: string;
  current: "arena" | "workspace" | "results" | "trace" | "suites";
}) {
  const he = language === "he";
  const base = evaluationPath ?? "/evaluations";
  const items = evaluationPath
    ? [
        ["workspace", base, he ? "סביבת הרצה" : "Workspace"],
        ["results", `${base}/results`, he ? "תוצאות" : "Results"],
        ["trace", `${base}/trace`, he ? "עקבות וראיות" : "Trace & evidence"],
      ]
    : [
        ["arena", "/evaluations", he ? "זירת הערכה" : "Evaluation arena"],
        ["suites", "/evaluation-suites", he ? "סדרות רגרסיה" : "Regression suites"],
      ];

  return (
    <nav className="evaluation-subnav" aria-label={he ? "תצוגות מעבדת ההערכה" : "Evaluation lab views"}>
      {items.map(([key, to, label]) => (
        <Link key={key} to={to} aria-current={current === key ? "page" : undefined}>{label}</Link>
      ))}
    </nav>
  );
}
