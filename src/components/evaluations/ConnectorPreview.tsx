import type { ConnectedActionPreview } from "../../evaluations";
import type { EvaluationLanguage } from "../../evaluations/uiText";
import { EvaluationBadge } from "./EvaluationBadge";

export function ConnectorPreview({
  language,
  preview,
  onSave,
}: {
  language: EvaluationLanguage;
  preview?: ConnectedActionPreview;
  onSave?: () => void;
}) {
  const he = language === "he";
  return (
    <section className="evaluation-panel evaluation-preview" aria-labelledby="preview-heading">
      <div className="evaluation-section-heading">
        <div><p className="eyebrow">{he ? "תצוגה מקדימה בלבד" : "Preview only"}</p><h2 id="preview-heading">{he ? "טיוטת GitHub PR" : "GitHub PR draft"}</h2></div>
        <EvaluationBadge tone="danger">{preview ? (he ? "לא זמין · נשמר מקומית" : "Unavailable · saved locally") : (he ? "לא זמין" : "Unavailable")}</EvaluationBadge>
      </div>
      <p>{he ? "לא זוהה connector פעיל. האקדמיה לא תכתוב ל־GitHub ולא תבקש פרטי כניסה בדפדפן." : "No active connector was detected. The Academy will not write to GitHub or request browser credentials."}</p>
      <dl className="evaluation-preview-details">
        <div><dt>{he ? "יעד" : "Target"}</dt><dd>{he ? "Pull request חדש — טיוטה בלבד" : "New pull request — draft only"}</dd></div>
        <div><dt>{he ? "הרשאות נדרשות" : "Required permissions"}</dt><dd>{he ? "קריאת repository; כתיבת pull request" : "Repository read; pull request write"}</dd></div>
        <div><dt>{he ? "סיכון" : "Risk"}</dt><dd>{he ? "בינוני; כתיבה חיצונית חסומה" : "Medium; external write is blocked"}</dd></div>
        <div><dt>{he ? "התאוששות" : "Recovery"}</dt><dd>{he ? "מחיקת הטיוטה לאחר אישור מפורש" : "Delete the draft after explicit approval"}</dd></div>
      </dl>
      <button type="button" onClick={onSave} disabled={Boolean(preview) || !onSave}>
        {!onSave
          ? (he ? "Connector לא זמין" : "Connector unavailable")
          : preview
            ? (he ? "התצוגה נשמרה מקומית" : "Preview saved locally")
            : (he ? "שמירת תצוגה מקדימה מקומית" : "Save preview locally")}
      </button>
    </section>
  );
}
