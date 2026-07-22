import { readFileSync, writeFileSync } from "node:fs";

const REPORT_PATH = "quality/generated/latest-quality-report.json";

/**
 * Deterministic, rule-based analysis — not an AI model. This is a plain-JS
 * mirror of src/quality/qualityStatus.ts + qualityAnalyzer.ts for use in this
 * Node CLI context (which cannot import the app's TypeScript modules directly
 * without adding a TS-execution dependency). The TS modules are the tested
 * source of truth for what the QA Center UI displays (see their Vitest
 * coverage); keep the two in sync when changing either. See docs/quality-gates.md.
 */
function isCoverageBelowThreshold(report) {
  const coverage = report.coverage;
  if (!coverage) return false;
  if (coverage.status === "failed") return true;
  const t = coverage.thresholds;
  return (
    coverage.statements < t.statements ||
    coverage.branches < t.branches ||
    coverage.functions < t.functions ||
    coverage.lines < t.lines
  );
}

function hasSevereAccessibilityViolation(report) {
  if (report.gates.accessibility.status === "failed") return true;
  const a11y = report.accessibility;
  if (!a11y) return false;
  return (
    a11y.violationsBySeverity.critical > 0 ||
    a11y.violationsBySeverity.serious > 0
  );
}

function hasBlockingGateFailure(gates) {
  const mandatory = ["lint", "unitTests", "coverage", "build", "e2eFast", "e2eFull", "accessibility", "visual", "performance", "gitDiff"];
  return mandatory.some((name) => gates[name].status !== "passed") || gates.manualChecklist.status === "failed";
}

/**
 * A CI-collected report has no way to know whether a human completed the
 * manual release checklist, so `checklistComplete` is always treated as
 * unknown/false here — this function can report Blocked or Ready with
 * warnings, but never Ready. The QA Center UI recomputes this itself with the
 * real local checklist state (see qualityStatus.ts) rather than trusting this
 * field from an imported/generated report.
 */
function computeReleaseStatus(report) {
  if (hasBlockingGateFailure(report.gates)) return "blocked";
  if (isCoverageBelowThreshold(report)) return "blocked";
  if (hasSevereAccessibilityViolation(report)) return "blocked";
  return "readyWithWarnings";
}

const gateNames = [
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

function analyze(report) {
  const overallStatus = computeReleaseStatus(report);
  const failedGates = gateNames.filter(
    (n) => report.gates[n].status === "failed",
  );
  const warningGates = gateNames.filter(
    (n) =>
      report.gates[n].status === "warning" ||
      (n === "manualChecklist" && report.gates[n].status !== "passed"),
  );

  const recommendedActions = [];
  const likelyAffectedAreas = [];
  const addArea = (en, he) => {
    if (!likelyAffectedAreas.some((a) => a.en === en))
      likelyAffectedAreas.push({ en, he });
  };

  if (report.gates.build.status === "failed") {
    recommendedActions.push({
      en: "Build failed — fix it first; no other gate result can be trusted until the app builds. (Blocks release.)",
      he: "הבנייה נכשלה — יש לתקן קודם; אין לסמוך על שאר תוצאות השערים עד שהאפליקציה נבנית. (חוסם שחרור.)",
    });
    addArea("Build / compilation", "בנייה / קומפילציה");
  }
  if (report.gates.lint.status === "failed") {
    recommendedActions.push({
      en: "Lint failed — resolve reported issues. (Blocks release.)",
      he: "בדיקת הלינט נכשלה — יש לתקן את הבעיות שדווחו. (חוסם שחרור.)",
    });
    addArea("Source code quality", "איכות קוד המקור");
  }
  if (report.gates.unitTests.status === "failed") {
    recommendedActions.push({
      en: "Unit/component tests failed — review the failing Vitest output. (Blocks release.)",
      he: "בדיקות יחידה/רכיב נכשלו — יש לבדוק את פלט ה-Vitest שנכשל. (חוסם שחרור.)",
    });
    addArea("Application logic (Vitest)", "לוגיקת האפליקציה (Vitest)");
  }
  if (
    report.gates.e2eFast.status === "failed" ||
    report.gates.e2eFull.status === "failed"
  ) {
    recommendedActions.push({
      en: "End-to-end tests failed — review the failing Playwright scenarios. (Blocks release.)",
      he: "בדיקות קצה-לקצה נכשלו — יש לבדוק את תרחישי ה-Playwright שנכשלו. (חוסם שחרור.)",
    });
    addArea("End-to-end user flows", "תהליכי משתמש מקצה לקצה");
  }
  if (isCoverageBelowThreshold(report)) {
    recommendedActions.push({
      en: "Coverage is below the enforced threshold — add tests for the newly uncovered code. (Blocks release.)",
      he: "הכיסוי נמוך מהסף האכיף — יש להוסיף בדיקות לקוד שאינו מכוסה. (חוסם שחרור.)",
    });
    addArea("Test coverage", "כיסוי בדיקות");
  }
  if (hasSevereAccessibilityViolation(report)) {
    recommendedActions.push({
      en: "A serious or critical accessibility violation was found — review recommended before release. (Blocks release.)",
      he: "נמצאה הפרת נגישות חמורה או קריטית — מומלצת בדיקה לפני שחרור. (חוסם שחרור.)",
    });
    addArea("Accessibility", "נגישות");
  }
  if (report.gates.gitDiff.status === "failed") {
    recommendedActions.push({
      en: "The Git diff check failed — review the diff for unintended or malformed changes. (Blocks release.)",
      he: "בדיקת ה-Git diff נכשלה — יש לבדוק את השינויים הבלתי צפויים או הפגומים. (חוסם שחרור.)",
    });
    addArea("Repository diff", "שינויים ברפוזיטורי");
  }
  if (
    report.gates.visual.status === "warning" ||
    report.gates.visual.status === "failed"
  ) {
    recommendedActions.push({
      en: "Visual differences were detected — review and resolve them; this mandatory gate blocks release until it passes.",
      he: "זוהו הבדלים ויזואליים — מומלצת בדיקה ידנית לאישור שהשינוי מכוון.",
    });
    addArea("Visual UI", "ממשק ויזואלי");
  }
  if (
    report.gates.performance.status === "warning" ||
    report.gates.performance.status === "failed"
  ) {
    recommendedActions.push({
      en: "Performance is below a target threshold — resolve it; this mandatory gate blocks release until it passes.",
      he: "הביצועים נמוכים מהיעד — מומלצת בדיקה לפני שחרור לייצור.",
    });
    addArea("Performance", "ביצועים");
  }
  if (
    report.gates.e2eFull.status === "notRun" ||
    report.gates.e2eFull.status === "notAvailable"
  ) {
    recommendedActions.push({
      en: "The full E2E browser matrix has not run — review recommended before a production release.",
      he: "מטריצת ה-E2E המלאה טרם רצה — מומלצת בדיקה לפני שחרור לייצור.",
    });
  }
  recommendedActions.push({
    en: "This report was generated by CI/CLI tooling and cannot confirm the manual release checklist — complete it in the QA Center before a production release.",
    he: "דוח זה נוצר על ידי כלי CI/CLI ואינו יכול לאשר את רשימת הבדיקה הידנית — יש להשלים אותה במרכז ה-QA לפני שחרור לייצור.",
  });

  const gateLabel = {
    lint: "Lint",
    unitTests: "Unit tests",
    coverage: "Coverage",
    build: "Build",
    e2eFast: "E2E fast",
    e2eFull: "E2E full",
    accessibility: "Accessibility",
    visual: "Visual regression",
    performance: "Performance",
    manualChecklist: "Manual checklist",
    gitDiff: "Git diff check",
  };
  const list = (names) =>
    names.length ? names.map((n) => gateLabel[n]).join(", ") : "none";

  return {
    overallStatus,
    summaryEn: `Status: ${overallStatus}. Failed gates: ${list(failedGates)}. Warning gates: ${list(warningGates)}.`,
    summaryHe: `סטטוס: ${overallStatus}. שערים שנכשלו: ${list(failedGates)}. שערים עם אזהרה: ${list(warningGates)}.`,
    failedGates,
    warningGates,
    recommendedActions,
    likelyAffectedAreas,
  };
}

function main() {
  let report;
  try {
    report = JSON.parse(readFileSync(REPORT_PATH, "utf8"));
  } catch {
    console.error(
      `Could not read ${REPORT_PATH}. Run "npm run quality:collect" first.`,
    );
    process.exit(1);
  }

  const analyzerSummary = analyze(report);
  report.overallStatus = analyzerSummary.overallStatus;
  report.analyzerSummary = analyzerSummary;
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`\nQuality analysis — ${analyzerSummary.overallStatus}`);
  console.log(analyzerSummary.summaryEn);
  console.log("\nRecommended actions:");
  for (const action of analyzerSummary.recommendedActions)
    console.log(`  - ${action.en}`);

  if (analyzerSummary.overallStatus === "blocked") {
    console.error("\nQuality analysis result: BLOCKED.");
    process.exit(1);
  }
}

main();
