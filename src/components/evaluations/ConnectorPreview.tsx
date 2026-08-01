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
  const permissionLabel = (permission: string) =>
    he
      ? ({
          "repository:read": "קריאת מאגר",
          "pull-request:write": "יצירת טיוטת Pull Request",
        }[permission] ?? "הרשאה לא מוכרת")
      : permission;
  const connectorLabel = (value: string) =>
    he ? ({ github: "GitHub" }[value.toLowerCase()] ?? "שירות חיצוני") : value;
  const actionLabel = (value: string) =>
    he ? ({ "create-draft-pull-request": "יצירת טיוטת Pull Request" }[value] ?? "פעולה מחוברת") : value;
  const targetLabel = (value: string) =>
    he && value.startsWith("Evaluation ") ? `ניסוי ${value.slice("Evaluation ".length)}` : value;
  const status =
    preview?.status === "expired"
      ? he
        ? "פג תוקף"
        : "Expired"
      : preview
        ? he
          ? "לא זמין · נשמר מקומית"
          : "Unavailable · saved locally"
        : he
          ? "לא זמין"
          : "Unavailable";
  return (
    <section
      className="evaluation-panel evaluation-preview"
      aria-labelledby="preview-heading"
    >
      <div className="evaluation-section-heading">
        <div>
          <p className="eyebrow">{he ? "תצוגה מקדימה בלבד" : "Preview only"}</p>
          <h2 id="preview-heading">
            {preview
              ? `${connectorLabel(preview.connectorType)} · ${actionLabel(preview.actionType)}`
              : he
                ? "טיוטת פעולה מחוברת"
                : "Connected action draft"}
          </h2>
        </div>
        <EvaluationBadge tone="danger">{status}</EvaluationBadge>
      </div>
      <p>
        {he
          ? "אין connector פעיל. ה־Academy לא תכתוב ל־GitHub או לשירות חיצוני אחר ולא תבקש פרטי כניסה בדפדפן."
          : "No active connector is available. The Academy will not write to GitHub or another external service, or request browser credentials."}
      </p>
      <dl className="evaluation-preview-details">
        <div>
          <dt>{he ? "יעד" : "Target"}</dt>
          <dd>{preview ? targetLabel(preview.targetSummary) : (he ? "לא הוגדר" : "Not defined")}</dd>
        </div>
        <div>
          <dt>{he ? "תוכן הטיוטה" : "Draft payload"}</dt>
          <dd>
            {preview?.payloadSummary[language] ??
              (he ? "טרם נוצרה טיוטה" : "No draft created yet")}
          </dd>
        </div>
        <div>
          <dt>{he ? "הרשאות נדרשות" : "Required permissions"}</dt>
          <dd>
            {preview?.requiredPermissions.map(permissionLabel).join("; ") ??
              (he ? "לא הוגדרו" : "Not defined")}
          </dd>
        </div>
        <div>
          <dt>{he ? "שדות שיושמטו" : "Omitted fields"}</dt>
          <dd>
            {he
              ? "פרטי כניסה, סודות, תוכן גולמי ונתיבים פרטיים"
              : "Credentials, secrets, raw content, and private paths"}
          </dd>
        </div>
        <div>
          <dt>{he ? "סיכון והפיכות" : "Risk and reversibility"}</dt>
          <dd>
            {preview
              ? `${he ? { low: "נמוך", medium: "בינוני", high: "גבוה" }[preview.riskLevel] : preview.riskLevel}; ${preview.reversible ? (he ? "הפיך" : "reversible") : he ? "אינו הפיך" : "not reversible"}`
              : he
                ? "לא הוערך"
                : "Not assessed"}
          </dd>
        </div>
        <div>
          <dt>{he ? "תפוגה" : "Expires"}</dt>
          <dd>
            {preview ? (
              <time dateTime={preview.expiresAt}>{preview.expiresAt}</time>
            ) : he ? (
              "לא נקבעה"
            ) : (
              "Not set"
            )}
          </dd>
        </div>
        <div>
          <dt>{he ? "התאוששות" : "Recovery"}</dt>
          <dd>
            {preview?.recoveryPlan?.[language] ??
              (he ? "לא הוגדרה" : "Not defined")}
          </dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={onSave}
        disabled={Boolean(preview && preview.status !== "expired") || !onSave}
      >
        {!onSave
          ? he
            ? "Connector לא זמין"
            : "Connector unavailable"
          : preview?.status === "expired"
            ? he
              ? "יצירת טיוטה מקומית חדשה"
              : "Create a fresh local draft"
            : preview
              ? he
                ? "התצוגה נשמרה מקומית"
                : "Preview saved locally"
              : he
                ? "שמירת תצוגה מקדימה מקומית"
                : "Save preview locally"}
      </button>
    </section>
  );
}
