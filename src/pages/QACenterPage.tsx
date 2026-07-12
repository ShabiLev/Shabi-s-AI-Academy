import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { qaUi } from "../quality/qaUiText";
import { analyzeQuality } from "../quality/qualityAnalyzer";
import { buildMetadata } from "../quality/buildMetadata";
import {
  computeReportStaleness,
  loadImportedReportJsonText,
  saveImportedReportJsonText,
  clearImportedReportJsonText,
  sampleQualityReport,
} from "../quality/qualityData";
import {
  parseQualityReport,
  parseQualityReportText,
} from "../quality/qualitySchema";
import { readFileAsText } from "../quality/fileText";
import { releaseStatusFromLoadResult } from "../quality/qualityStatus";
import {
  getChecklistForVersion,
  getManualChecklistGateStatus,
  loadIssues,
  saveChecklistForVersion,
} from "../quality/qualityStorage";
import type { GateName, QualityReportLoadResult } from "../quality/types";
import { IssueRegister } from "../components/qa/IssueRegister";
import { ReleaseChecklist } from "../components/qa/ReleaseChecklist";
import { Link } from "react-router-dom";
import {
  isChecklistComplete,
  type ManualChecklistKey,
} from "../quality/checklist";
import { useRuntime } from "../runtime/RuntimeContext";

const gateOrder: GateName[] = [
  "lint",
  "unitTests",
  "coverage",
  "build",
  "e2eFast",
  "e2eFull",
  "accessibility",
  "visual",
  "performance",
  "manualChecklist",
  "gitDiff",
];

function formatDate(iso: string, locale: string): string {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? iso : parsed.toLocaleString(locale);
}

export function QACenterPage() {
  const { language, t } = useLanguage();
  const ui = language === "he" ? "he" : "en";
  const s = qaUi[ui];
  const runtime = useRuntime();
  const locale = ui === "he" ? "he-IL" : "en-US";

  const [importedText, setImportedText] = useState<string | null>(() =>
    loadImportedReportJsonText(),
  );
  const [generatedReportRaw, setGeneratedReportRaw] =
    useState<unknown>(undefined);
  const [sampleEnabled, setSampleEnabled] = useState(false);
  const [issues, setIssues] = useState(() => loadIssues());
  const [checklist, setChecklist] = useState(() =>
    getChecklistForVersion(buildMetadata.version),
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/generated/latest-quality-report.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setGeneratedReportRaw(data);
      })
      .catch(() => {
        if (!cancelled) setGeneratedReportRaw(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { sourceKind, loadResult } = useMemo((): {
    sourceKind: "imported" | "generated" | "sample" | "none";
    loadResult: QualityReportLoadResult;
  } => {
    if (importedText)
      return {
        sourceKind: "imported",
        loadResult: parseQualityReportText(importedText),
      };
    if (generatedReportRaw)
      return {
        sourceKind: "generated",
        loadResult: parseQualityReport(generatedReportRaw),
      };
    if (sampleEnabled)
      return {
        sourceKind: "sample",
        loadResult: { kind: "ok", report: sampleQualityReport },
      };
    return { sourceKind: "none", loadResult: { kind: "empty" } };
  }, [importedText, generatedReportRaw, sampleEnabled]);

  const checklistComplete = isChecklistComplete(checklist.manualChecks);
  const manualChecklistStatus = getManualChecklistGateStatus(
    buildMetadata.version,
  );
  const releaseStatus = releaseStatusFromLoadResult(
    loadResult,
    checklistComplete,
  );
  const analyzerSummary =
    loadResult.kind === "ok"
      ? analyzeQuality(loadResult.report, checklistComplete)
      : null;
  const staleness =
    loadResult.kind === "ok"
      ? computeReportStaleness(
          loadResult.report,
          buildMetadata.version,
          buildMetadata.commitSha === "local" ? null : buildMetadata.commitSha,
          new Date().toISOString(),
        )
      : null;

  const toggleManualCheck = (key: ManualChecklistKey, checked: boolean) => {
    const next = saveChecklistForVersion({
      ...checklist,
      manualChecks: { ...checklist.manualChecks, [key]: checked },
    });
    setChecklist(next);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    readFileAsText(file).then((text) => {
      saveImportedReportJsonText(text);
      setImportedText(text);
    });
  };

  const clearImport = () => {
    clearImportedReportJsonText();
    setImportedText(null);
  };

  const report = loadResult.kind === "ok" ? loadResult.report : null;

  return (
    <div className="page qa-center-page">
      <div className="page-heading">
        <h1>{t("pages.qaTitle")}</h1>
        <p>{t("pages.qaDescription")}</p>
        <Link to="/how-to#qa-center">{ui === "he" ? "עזרה" : "Help"}</Link>
      </div>

      <section
        className="settings-card qa-release-header"
        aria-labelledby="qa-release-title"
      >
        <h2 id="qa-release-title">{s.releaseHeader}</h2>
        <dl className="qa-header-grid">
          <div>
            <dt>{s.version}</dt>
            <dd>{buildMetadata.version}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd className={`qa-status-badge qa-status-${releaseStatus}`}>
              {s.status[releaseStatus]}
            </dd>
          </div>
          <div>
            <dt>{s.environment}</dt>
            <dd>{report?.environment ?? s.notAvailable}</dd>
          </div>
          <div>
            <dt>{s.lastValidated}</dt>
            <dd>
              {report ? formatDate(report.generatedAt, locale) : s.notAvailable}
            </dd>
          </div>
          <div>
            <dt>{s.commit}</dt>
            <dd data-visual-mask="commit">{buildMetadata.commitSha}</dd>
          </div>
          <div>
            <dt>{s.branch}</dt>
            <dd data-visual-mask="branch">{buildMetadata.branch}</dd>
          </div>
        </dl>

        <p className="qa-source-line">
          {sourceKind === "imported" && s.source.imported}
          {sourceKind === "generated" && s.source.generated}
          {sourceKind === "sample" && s.source.sample}
          {sourceKind === "none" && s.source.none}
        </p>
        {sourceKind === "none" && <p>{s.source.noneDescription}</p>}

        {loadResult.kind === "invalid" && (
          <p role="alert">{s.source.invalidReport}</p>
        )}
        {loadResult.kind === "unsupportedSchema" && (
          <p role="alert">{s.source.unsupportedSchema}</p>
        )}

        {staleness?.versionMismatch && (
          <p role="status">{s.source.staleVersionWarning}</p>
        )}
        {staleness?.commitMismatch && (
          <p role="status">{s.source.staleCommitWarning}</p>
        )}
        {staleness?.old && <p role="status">{s.source.staleOldWarning}</p>}

        <div className="card-actions">
          <label className="qa-import-button">
            {s.source.importButton}
            <input
              type="file"
              accept="application/json"
              onChange={handleImport}
            />
          </label>
          {importedText && (
            <button type="button" onClick={clearImport}>
              {s.source.clearImport}
            </button>
          )}
          {sourceKind !== "imported" && sourceKind !== "generated" && (
            <button type="button" onClick={() => setSampleEnabled((v) => !v)}>
              {sampleEnabled ? s.source.clearSample : s.source.loadSample}
            </button>
          )}
        </div>
      </section>

      <section
        className="settings-card"
        aria-labelledby="runtime-quality-title"
      >
        <h2 id="runtime-quality-title">
          {ui === "he" ? "איכות Runtime" : "Runtime quality"}
        </h2>
        <p>
          {ui === "he"
            ? "הסטטוסים מתארים יכולות זמינות, לא תוצאת CI מומצאת."
            : "These statuses describe available capabilities, not fabricated CI results."}
        </p>
        <ul className="qa-gate-grid">
          {[
            "Runtime unit tests",
            "State-machine tests",
            "MockProvider tests",
            "Dry Run tests",
            "Runtime E2E tests",
            "Runtime accessibility tests",
            "Runtime storage validation",
          ].map((label) => (
            <li key={label}>
              <span>{label}</span>
              <span className="qa-status-badge qa-status-gate-notRun">
                {s.gateStatus.notRun}
              </span>
            </li>
          ))}
          <li>
            <span>Mock Provider</span>
            <span className="qa-status-badge qa-status-gate-passed">
              {ui === "he" ? "זמין" : "Available"}
            </span>
          </li>
          <li>
            <span>Live Provider</span>
            <span className="qa-status-badge qa-status-gate-warning">
              {ui === "he" ? "לא מוגדר" : "Not configured"}
            </span>
          </li>
        </ul>
        <p>
          {ui === "he"
            ? `רשומות מקומיות: ${runtime.runs.length}`
            : `Local records: ${runtime.runs.length}`}
        </p>
      </section>

      <section
        className="settings-card qa-gates"
        aria-labelledby="qa-gates-title"
      >
        <h2 id="qa-gates-title">{s.section.gates}</h2>
        <ul className="qa-gate-grid">
          {gateOrder.map((name) => {
            const status =
              name === "manualChecklist"
                ? manualChecklistStatus
                : (report?.gates[name].status ?? "notAvailable");
            return (
              <li key={name}>
                <span>{s.gate[name]}</span>
                <span className={`qa-status-badge qa-status-gate-${status}`}>
                  {s.gateStatus[status]}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        className="settings-card qa-tests"
        aria-labelledby="qa-tests-title"
      >
        <h2 id="qa-tests-title">{s.section.tests}</h2>
        {report?.tests.vitest || report?.tests.playwright ? (
          <dl className="qa-header-grid">
            {report.tests.vitest && (
              <div>
                <dt>{s.tests.vitestLabel}</dt>
                <dd>
                  {report.tests.vitest.total} {s.tests.total} ·{" "}
                  {report.tests.vitest.failed} {s.tests.failed} ·{" "}
                  {report.tests.vitest.skipped} {s.tests.skipped}
                </dd>
              </div>
            )}
            {report.tests.playwright && (
              <div>
                <dt>{s.tests.playwrightLabel}</dt>
                <dd>
                  {report.tests.playwright.total} {s.tests.total} ·{" "}
                  {report.tests.playwright.failed} {s.tests.failed} ·{" "}
                  {report.tests.playwright.browserProjects}{" "}
                  {s.tests.browserProjects}
                </dd>
              </div>
            )}
          </dl>
        ) : (
          <p>{s.tests.notAvailable}</p>
        )}
      </section>

      <section
        className="settings-card qa-coverage"
        aria-labelledby="qa-coverage-title"
      >
        <h2 id="qa-coverage-title">{s.section.coverage}</h2>
        {report?.coverage ? (
          <dl className="qa-header-grid">
            <div>
              <dt>{s.coverage.statements}</dt>
              <dd>
                {report.coverage.statements}% ({s.coverage.threshold}{" "}
                {report.coverage.thresholds.statements}%)
              </dd>
            </div>
            <div>
              <dt>{s.coverage.branches}</dt>
              <dd>
                {report.coverage.branches}% ({s.coverage.threshold}{" "}
                {report.coverage.thresholds.branches}%)
              </dd>
            </div>
            <div>
              <dt>{s.coverage.functions}</dt>
              <dd>
                {report.coverage.functions}% ({s.coverage.threshold}{" "}
                {report.coverage.thresholds.functions}%)
              </dd>
            </div>
            <div>
              <dt>{s.coverage.lines}</dt>
              <dd>
                {report.coverage.lines}% ({s.coverage.threshold}{" "}
                {report.coverage.thresholds.lines}%)
              </dd>
            </div>
          </dl>
        ) : (
          <p>{s.coverage.notAvailable}</p>
        )}
        <p className="qa-muted-note">
          {s.coverage.trend}: {s.coverage.trendUnavailable}
        </p>
      </section>

      <section
        className="settings-card qa-accessibility"
        aria-labelledby="qa-a11y-title"
      >
        <h2 id="qa-a11y-title">{s.section.accessibility}</h2>
        {report?.accessibility ? (
          <>
            <dl className="qa-header-grid">
              <div>
                <dt>{s.a11y.scannedPages}</dt>
                <dd>{report.accessibility.scannedPages}</dd>
              </div>
              <div>
                <dt>{s.a11y.critical}</dt>
                <dd>{report.accessibility.violationsBySeverity.critical}</dd>
              </div>
              <div>
                <dt>{s.a11y.serious}</dt>
                <dd>{report.accessibility.violationsBySeverity.serious}</dd>
              </div>
              <div>
                <dt>{s.a11y.moderate}</dt>
                <dd>{report.accessibility.violationsBySeverity.moderate}</dd>
              </div>
              <div>
                <dt>{s.a11y.minor}</dt>
                <dd>{report.accessibility.violationsBySeverity.minor}</dd>
              </div>
              <div>
                <dt>{s.a11y.allowedIssues}</dt>
                <dd>{report.accessibility.allowedIssues.length}</dd>
              </div>
              <div>
                <dt>{s.a11y.manualReview}</dt>
                <dd>
                  {report.accessibility.manualReviewStatus === "complete"
                    ? s.a11y.manualReviewComplete
                    : report.accessibility.manualReviewStatus === "incomplete"
                      ? s.a11y.manualReviewIncomplete
                      : s.a11y.manualReviewNotStarted}
                </dd>
              </div>
            </dl>
          </>
        ) : (
          <p>{s.a11y.notAvailable}</p>
        )}
        <p className="qa-muted-note">{s.a11y.disclaimer}</p>
      </section>

      <section
        className="settings-card qa-visual"
        aria-labelledby="qa-visual-title"
      >
        <h2 id="qa-visual-title">{s.section.visual}</h2>
        {report?.visual ? (
          <dl className="qa-header-grid">
            <div>
              <dt>{s.visual.baselineCount}</dt>
              <dd>{report.visual.baselineCount}</dd>
            </div>
            <div>
              <dt>{s.visual.compared}</dt>
              <dd>{report.visual.comparedCount}</dd>
            </div>
            <div>
              <dt>{s.visual.mismatches}</dt>
              <dd>{report.visual.mismatches}</dd>
            </div>
            <div>
              <dt>{s.visual.environment}</dt>
              <dd>{report.visual.baselineEnvironment}</dd>
            </div>
            <div>
              <dt>{s.visual.lastUpdate}</dt>
              <dd>
                {report.visual.lastBaselineUpdate
                  ? formatDate(report.visual.lastBaselineUpdate, locale)
                  : s.notAvailable}
              </dd>
            </div>
          </dl>
        ) : (
          <p>{s.visual.notAvailable}</p>
        )}
      </section>

      <section
        className="settings-card qa-performance"
        aria-labelledby="qa-performance-title"
      >
        <h2 id="qa-performance-title">{s.section.performance}</h2>
        {report?.performance && report.performance.routes.length ? (
          <ul className="qa-performance-list">
            {report.performance.routes.map((route) => (
              <li key={`${route.route}-${route.device}`}>
                <strong>
                  {route.route} ·{" "}
                  {route.device === "desktop"
                    ? s.performance.desktop
                    : s.performance.mobile}
                </strong>
                <span>
                  {s.performance.route}: {route.performance} ·{" "}
                  {s.section.accessibility}: {route.accessibility} ·{" "}
                  {route.bestPractices} · {route.seo}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>{s.performance.notAvailable}</p>
        )}
        <p className="qa-muted-note">{s.performance.disclaimer}</p>
      </section>

      <section
        className="settings-card qa-known-issues"
        aria-labelledby="qa-known-issues-title"
      >
        <h2 id="qa-known-issues-title">{s.section.knownIssues}</h2>
        <dl className="qa-header-grid">
          <div>
            <dt>{s.knownIssues.openCount}</dt>
            <dd>
              {
                issues.filter(
                  (i) => i.status === "open" || i.status === "inProgress",
                ).length
              }
            </dd>
          </div>
          <div>
            <dt>{s.severity.critical}</dt>
            <dd>
              {
                issues.filter(
                  (i) => i.severity === "critical" && i.status !== "resolved",
                ).length
              }
            </dd>
          </div>
          <div>
            <dt>{s.severity.high}</dt>
            <dd>
              {
                issues.filter(
                  (i) => i.severity === "high" && i.status !== "resolved",
                ).length
              }
            </dd>
          </div>
        </dl>
      </section>

      <section
        className="settings-card qa-analyzer"
        aria-labelledby="qa-analyzer-title"
      >
        <h2 id="qa-analyzer-title">{s.analyzer.title}</h2>
        {analyzerSummary ? (
          <>
            <p>
              {ui === "he"
                ? analyzerSummary.summaryHe
                : analyzerSummary.summaryEn}
            </p>
            <h3>{s.analyzer.recommendedActions}</h3>
            <ul>
              {analyzerSummary.recommendedActions.map((action, i) => (
                <li key={i}>{ui === "he" ? action.he : action.en}</li>
              ))}
            </ul>
            {analyzerSummary.likelyAffectedAreas.length > 0 && (
              <>
                <h3>{s.analyzer.likelyAffectedAreas}</h3>
                <ul>
                  {analyzerSummary.likelyAffectedAreas.map((area) => (
                    <li key={area.en}>{ui === "he" ? area.he : area.en}</li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <p>{s.status.notEvaluated}</p>
        )}
      </section>

      <ReleaseChecklist
        version={buildMetadata.version}
        gates={report?.gates ?? null}
        manualChecks={checklist.manualChecks}
        onToggle={toggleManualCheck}
        ui={ui}
      />

      <IssueRegister issues={issues} onChange={setIssues} ui={ui} />
    </div>
  );
}
