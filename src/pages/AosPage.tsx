import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { useAosSnapshot } from "../aos/useAosSnapshot";
import { aosUi } from "../aos/aosUiText";

function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso) return "—";
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? iso : parsed.toLocaleString(locale);
}

export function AosPage() {
  const { language } = useLanguage();
  const ui = language === "he" ? "he" : "en";
  const s = aosUi[ui];
  const locale = ui === "he" ? "he-IL" : "en-US";
  const result = useAosSnapshot();

  return (
    <div className="page aos-page">
      <div className="page-heading">
        <h1>{s.title}</h1>
        <p>{s.subtitle}</p>
      </div>

      {result.kind === "loading" && <p role="status">…</p>}

      {result.kind === "notGenerated" && (
        <section className="settings-card" aria-labelledby="aos-not-generated">
          <h2 id="aos-not-generated">{s.notGeneratedTitle}</h2>
          <p>{s.notGeneratedBody}</p>
        </section>
      )}

      {result.kind === "error" && (
        <section className="settings-card" role="alert">
          <h2>{s.errorTitle}</h2>
          <p>{result.message}</p>
        </section>
      )}

      {result.kind === "ok" && (
        <>
          <p className="aos-generated-at">
            {s.generatedAt}: {formatDate(result.snapshot.generatedAt, locale)}
          </p>

          <section className="settings-card" aria-labelledby="aos-versions-title">
            <h2 id="aos-versions-title">{s.versionsHeading}</h2>
            <dl className="qa-header-grid">
              <div>
                <dt>{s.aosVersion}</dt>
                <dd><bdi className="aos-technical" dir="ltr">{result.snapshot.aosVersion}</bdi></dd>
              </div>
              <div>
                <dt>{s.appVersion}</dt>
                <dd><bdi className="aos-technical" dir="ltr">{result.snapshot.applicationVersion}</bdi></dd>
              </div>
              <div>
                <dt>{s.branch}</dt>
                <dd data-visual-mask="branch"><bdi className="aos-technical" dir="ltr">{result.snapshot.branch ?? "—"}</bdi></dd>
              </div>
              <div>
                <dt>{s.commit}</dt>
                <dd data-visual-mask="commit"><bdi className="aos-technical" dir="ltr">{result.snapshot.commit ?? "—"}</bdi></dd>
              </div>
            </dl>
          </section>

          <section className="settings-card" aria-labelledby="aos-modules-title">
            <h2 id="aos-modules-title">{s.modulesHeading}</h2>
            <p>
              {s.modulesTotal}: {result.snapshot.modules.total}
            </p>
            <ul className="aos-category-list">
              {Object.entries(result.snapshot.modules.byCategory).map(([category, count]) => (
                <li key={category}>
                  <bdi className="aos-technical" dir="ltr">{category}: {count}</bdi>
                </li>
              ))}
            </ul>
            <Link to="/aos/modules">{s.viewAllModules}</Link>
          </section>

          <section className="settings-card" aria-labelledby="aos-supported-title">
            <h2 id="aos-supported-title">{s.supportedAgentsHeading}</h2>
            <ul>
              {result.snapshot.supportedAgents.map((agent) => (
                <li key={agent}><bdi className="aos-technical" dir="ltr">{agent}</bdi></li>
              ))}
            </ul>
            <h3>{s.taskTypesHeading}</h3>
            <p><bdi className="aos-technical" dir="ltr">{result.snapshot.taskTypes.join(", ")}</bdi></p>
          </section>

          <section className="settings-card" aria-labelledby="aos-evidence-title">
            <h2 id="aos-evidence-title">{s.evidenceHeading}</h2>
            {!result.snapshot.evidence.available ? (
              <p>{s.evidenceNone}</p>
            ) : (
              <dl className="qa-header-grid">
                <div>
                  <dt>{s.evidenceGates}</dt>
                  <dd>{result.snapshot.evidence.gateCount}</dd>
                </div>
                <div>
                  <dt>{s.evidencePassed}</dt>
                  <dd>{result.snapshot.evidence.passedCount}</dd>
                </div>
                <div>
                  <dt>{s.evidenceFailed}</dt>
                  <dd>{result.snapshot.evidence.failedCount}</dd>
                </div>
                <div>
                  <dt>{s.evidenceNotAvailable}</dt>
                  <dd>{result.snapshot.evidence.notAvailableCount}</dd>
                </div>
              </dl>
            )}
            <Link to="/aos/evidence">{s.subNavEvidence}</Link>
          </section>

          <section className="settings-card" aria-labelledby="aos-research-title">
            <h2 id="aos-research-title">{s.researchHeading}</h2>
            <dl className="qa-header-grid">
              <div>
                <dt>{s.researchSources}</dt>
                <dd>{result.snapshot.research.sources}</dd>
              </div>
              <div>
                <dt>{s.researchClaims}</dt>
                <dd>{result.snapshot.research.claims}</dd>
              </div>
              <div>
                <dt>{s.researchCandidates}</dt>
                <dd>{result.snapshot.research.candidates}</dd>
              </div>
              <div>
                <dt>{s.researchReviews}</dt>
                <dd>{result.snapshot.research.reviews}</dd>
              </div>
              <div>
                <dt>{s.researchPublished}</dt>
                <dd>{result.snapshot.research.published}</dd>
              </div>
            </dl>
            <Link to="/aos/research">{s.subNavResearch}</Link>
          </section>

          <section className="settings-card" aria-labelledby="aos-handoff-title">
            <h2 id="aos-handoff-title">{s.handoffHeading}</h2>
            <p>{result.snapshot.activeHandoff ? String(result.snapshot.activeHandoff) : s.handoffNone}</p>
            <Link to="/aos/handoffs">{s.subNavHandoffs}</Link>
          </section>

          <section className="settings-card" aria-labelledby="aos-validation-title">
            <h2 id="aos-validation-title">{s.validationHeading}</h2>
            <p
              className={`qa-status-badge ${result.snapshot.validation.totalErrors === 0 ? "qa-status-gate-passed" : "qa-status-gate-failed"}`}
            >
              {result.snapshot.validation.totalErrors === 0
                ? s.validationOk
                : `${s.validationErrors}: ${result.snapshot.validation.totalErrors}`}
            </p>
          </section>

          <section className="settings-card" aria-labelledby="aos-progress-widget-title">
            <h2 id="aos-progress-widget-title">{ui === "he" ? "התקדמות וזיכרון" : "Progress and memory"}</h2>
            <dl className="qa-header-grid">
              <div><dt>{ui === "he" ? "מצב שחרור" : "Release state"}</dt><dd>{result.snapshot.memory.releaseState}</dd></div>
              <div><dt>{ui === "he" ? "השלמה" : "Progress"}</dt><dd>{result.snapshot.memory.completionPercent}%</dd></div>
              <div><dt>{ui === "he" ? "חסמים" : "Blockers"}</dt><dd>{result.snapshot.memory.blockerCount}</dd></div>
              <div><dt>{ui === "he" ? "עדכניות ראיות" : "Evidence freshness"}</dt><dd>{result.snapshot.memory.evidenceCurrent ? (ui === "he" ? "עדכני" : "Current") : (ui === "he" ? "נדרש אימות מחדש" : "Rerun required")}</dd></div>
            </dl>
            <p>{ui === "he" ? "הפעולה הבאה" : "Next action"}: {result.snapshot.memory.nextAction ?? "—"}</p>
            <div className="aos-subnav"><Link to="/aos/progress">{ui === "he" ? "התקדמות" : "Progress"}</Link><Link to="/aos/memory">{ui === "he" ? "זיכרון" : "Memory"}</Link></div>
          </section>

          <nav className="aos-subnav" aria-label={s.title}>
            <Link to="/aos/modules">{s.subNavModules}</Link>
            <Link to="/aos/research">{s.subNavResearch}</Link>
            <Link to="/aos/evidence">{s.subNavEvidence}</Link>
            <Link to="/aos/handoffs">{s.subNavHandoffs}</Link>
            <Link to="/aos/security">{s.subNavSecurity}</Link>
            <Link to="/aos/releases">{s.subNavReleases}</Link>
            <Link to="/aos/progress">{ui === "he" ? "התקדמות" : "Progress"}</Link>
            <Link to="/aos/memory">{ui === "he" ? "זיכרון" : "Memory"}</Link>
          </nav>
        </>
      )}
    </div>
  );
}
