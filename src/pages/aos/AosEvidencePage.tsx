import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { useAosSnapshot } from "../../aos/useAosSnapshot";
import { aosUi } from "../../aos/aosUiText";

function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return "—";
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? iso : parsed.toLocaleString(locale);
}

export function AosEvidencePage() {
  const { language } = useLanguage();
  const ui = language === "he" ? "he" : "en";
  const s = aosUi[ui];
  const locale = ui === "he" ? "he-IL" : "en-US";
  const result = useAosSnapshot();
  const evidence = result.kind === "ok" ? result.snapshot.evidence : null;

  return (
    <div className="page aos-evidence-page">
      <div className="page-heading">
        <h1>{s.evidenceHeading}</h1>
        <Link to="/aos">{s.backToDashboard}</Link>
      </div>

      {result.kind === "notGenerated" && <p>{s.notGeneratedBody}</p>}

      {evidence && !evidence.available && (
        <section className="settings-card">
          <p>{s.evidenceNone}</p>
        </section>
      )}

      {evidence?.available && (
        <section className="settings-card" aria-labelledby="aos-evidence-detail">
          <h2 id="aos-evidence-detail"><bdi className="aos-technical" dir="ltr">{evidence.runId}</bdi></h2>
          <dl className="qa-header-grid">
            <div>
              <dt>{ui === "he" ? "פרופיל" : "Profile"}</dt>
              <dd><bdi className="aos-technical" dir="ltr">{evidence.profile}</bdi></dd>
            </div>
            <div>
              <dt>{ui === "he" ? "גרסה" : "Version"}</dt>
              <dd><bdi className="aos-technical" dir="ltr">{evidence.version}</bdi></dd>
            </div>
            <div>
              <dt>{s.branch}</dt>
              <dd data-visual-mask="branch"><bdi className="aos-technical" dir="ltr">{evidence.branch}</bdi></dd>
            </div>
            <div>
              <dt>{ui === "he" ? "התחלה" : "Started"}</dt>
              <dd>{formatDate(evidence.startedAt, locale)}</dd>
            </div>
            <div>
              <dt>{ui === "he" ? "סיום" : "Ended"}</dt>
              <dd>{formatDate(evidence.endedAt, locale)}</dd>
            </div>
          </dl>
          <dl className="qa-header-grid">
            <div>
              <dt>{s.evidenceGates}</dt>
              <dd>{evidence.gateCount}</dd>
            </div>
            <div>
              <dt>{s.evidencePassed}</dt>
              <dd className="qa-status-badge qa-status-gate-passed">{evidence.passedCount}</dd>
            </div>
            <div>
              <dt>{s.evidenceFailed}</dt>
              <dd className="qa-status-badge qa-status-gate-failed">{evidence.failedCount}</dd>
            </div>
            <div>
              <dt>{s.evidenceNotAvailable}</dt>
              <dd className="qa-status-badge qa-status-gate-notAvailable">{evidence.notAvailableCount}</dd>
            </div>
          </dl>
          {evidence.failedGates && evidence.failedGates.length > 0 && (
            <>
              <h3>{s.evidenceFailed}</h3>
              <ul>
                {evidence.failedGates.map((gate) => (
                  <li key={gate}><bdi className="aos-technical" dir="ltr">{gate}</bdi></li>
                ))}
              </ul>
            </>
          )}
          <p>
            {ui === "he"
              ? "מקור: quality/runtime/execution/latest/summary.json — נתוני Runtime מקומיים, לא הוכחת שחרור מ-Git."
              : "Source: quality/runtime/execution/latest/summary.json — local runtime data, not Git-based release proof."}
          </p>
        </section>
      )}
    </div>
  );
}
