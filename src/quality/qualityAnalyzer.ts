import {
  computeReleaseStatus,
  hasSevereAccessibilityViolation,
  isCoverageBelowThreshold,
} from "./qualityStatus";
import {
  gateNames,
  type AnalyzerSummary,
  type BilingualText,
  type GateName,
  type QualityReport,
  type ReleaseStatus,
} from "./types";

const gateLabels: Record<GateName, BilingualText> = {
  lint: { he: "לינט", en: "Lint" },
  unitTests: { he: "בדיקות יחידה/רכיב", en: "Unit/component tests" },
  coverage: { he: "כיסוי קוד", en: "Coverage" },
  build: { he: "בנייה", en: "Build" },
  e2eFast: { he: "E2E מהיר", en: "E2E fast" },
  e2eFull: { he: "E2E מלא", en: "E2E full" },
  accessibility: { he: "נגישות", en: "Accessibility" },
  visual: { he: "רגרסיה ויזואלית", en: "Visual regression" },
  performance: { he: "ביצועים", en: "Performance" },
  manualChecklist: { he: "רשימת בדיקה ידנית", en: "Manual checklist" },
  gitDiff: { he: "בדיקת Git diff", en: "Git diff check" },
};

const statusLabels: Record<ReleaseStatus, BilingualText> = {
  ready: { he: "מוכן", en: "Ready" },
  readyWithWarnings: { he: "מוכן עם אזהרות", en: "Ready with warnings" },
  blocked: { he: "חסום", en: "Blocked" },
  notEvaluated: { he: "טרם נבדק", en: "Not evaluated" },
};

function gateList(names: GateName[], language: "he" | "en"): string {
  if (!names.length) return language === "he" ? "אין" : "none";
  return names.map((n) => gateLabels[n][language]).join(", ");
}

/**
 * Deterministic, rule-based analysis — not an AI model. Every recommendation maps
 * to an explicit rule below; nothing here infers a root cause the data doesn't show.
 */
export function analyzeQuality(
  report: QualityReport,
  checklistComplete: boolean,
): AnalyzerSummary {
  const overallStatus = computeReleaseStatus(report, checklistComplete);
  const failedGates = gateNames.filter(
    (name) => report.gates[name].status === "failed",
  );
  const warningGates = gateNames.filter((name) =>
    name === "manualChecklist"
      ? !checklistComplete
      : report.gates[name].status === "warning",
  );

  const recommendedActions: BilingualText[] = [];
  const likelyAffectedAreas: BilingualText[] = [];
  const addArea = (area: BilingualText) => {
    if (!likelyAffectedAreas.some((a) => a.en === area.en))
      likelyAffectedAreas.push(area);
  };

  if (report.gates.build.status === "failed") {
    recommendedActions.push({
      en: "Build failed — fix it first; no other gate result can be trusted until the app builds. (Blocks release.)",
      he: "הבנייה נכשלה — יש לתקן קודם; אין לסמוך על שאר תוצאות השערים עד שהאפליקציה נבנית. (חוסם שחרור.)",
    });
    addArea({ en: "Build / compilation", he: "בנייה / קומפילציה" });
  }
  if (report.gates.lint.status === "failed") {
    recommendedActions.push({
      en: "Lint failed — resolve reported issues. (Blocks release.)",
      he: "בדיקת הלינט נכשלה — יש לתקן את הבעיות שדווחו. (חוסם שחרור.)",
    });
    addArea({ en: "Source code quality", he: "איכות קוד המקור" });
  }
  if (report.gates.unitTests.status === "failed") {
    recommendedActions.push({
      en: "Unit/component tests failed — review the failing Vitest output. (Blocks release.)",
      he: "בדיקות יחידה/רכיב נכשלו — יש לבדוק את פלט ה-Vitest שנכשל. (חוסם שחרור.)",
    });
    addArea({
      en: "Application logic (Vitest)",
      he: "לוגיקת האפליקציה (Vitest)",
    });
  }
  if (
    report.gates.e2eFast.status === "failed" ||
    report.gates.e2eFull.status === "failed"
  ) {
    recommendedActions.push({
      en: "End-to-end tests failed — review the failing Playwright scenarios. (Blocks release.)",
      he: "בדיקות קצה-לקצה נכשלו — יש לבדוק את תרחישי ה-Playwright שנכשלו. (חוסם שחרור.)",
    });
    addArea({ en: "End-to-end user flows", he: "תהליכי משתמש מקצה לקצה" });
  }
  if (isCoverageBelowThreshold(report)) {
    recommendedActions.push({
      en: "Coverage is below the enforced threshold — add tests for the newly uncovered code. (Blocks release.)",
      he: "הכיסוי נמוך מהסף האכיף — יש להוסיף בדיקות לקוד שאינו מכוסה. (חוסם שחרור.)",
    });
    addArea({ en: "Test coverage", he: "כיסוי בדיקות" });
  }
  if (hasSevereAccessibilityViolation(report)) {
    recommendedActions.push({
      en: "A serious or critical accessibility violation was found — review recommended before release. (Blocks release.)",
      he: "נמצאה הפרת נגישות חמורה או קריטית — מומלצת בדיקה לפני שחרור. (חוסם שחרור.)",
    });
    addArea({ en: "Accessibility", he: "נגישות" });
  }
  if (report.gates.gitDiff.status === "failed") {
    recommendedActions.push({
      en: "The Git diff check failed — review the diff for unintended or malformed changes. (Blocks release.)",
      he: "בדיקת ה-Git diff נכשלה — יש לבדוק את השינויים הבלתי צפויים או הפגומים. (חוסם שחרור.)",
    });
    addArea({ en: "Repository diff", he: "שינויים ברפוזיטורי" });
  }
  if (
    report.gates.visual.status === "warning" ||
    report.gates.visual.status === "failed"
  ) {
    recommendedActions.push({
      en: "Visual differences were detected — review and resolve them; this mandatory gate blocks release until it passes.",
      he: "זוהו הבדלים ויזואליים — מומלצת בדיקה ידנית לאישור שהשינוי מכוון.",
    });
    addArea({ en: "Visual UI", he: "ממשק ויזואלי" });
  }
  if (
    report.gates.performance.status === "warning" ||
    report.gates.performance.status === "failed"
  ) {
    recommendedActions.push({
      en: "Performance is below a target threshold — resolve it; this mandatory gate blocks release until it passes.",
      he: "הביצועים נמוכים מהיעד — מומלצת בדיקה לפני שחרור לייצור.",
    });
    addArea({ en: "Performance", he: "ביצועים" });
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
  if (!checklistComplete) {
    recommendedActions.push({
      en: "The manual release checklist is incomplete — review recommended before a production release.",
      he: "רשימת הבדיקה הידנית לשחרור אינה מלאה — מומלצת בדיקה לפני שחרור לייצור.",
    });
  }
  if (!recommendedActions.length) {
    recommendedActions.push({
      en: "No blocking or warning conditions were detected in this report.",
      he: "לא זוהו תנאים חוסמים או מזהירים בדוח זה.",
    });
  }

  const summaryFor = (language: "he" | "en") => {
    const status = statusLabels[overallStatus][language];
    if (language === "he") {
      return `סטטוס: ${status}. שערים שנכשלו: ${gateList(failedGates, "he")}. שערים עם אזהרה: ${gateList(warningGates, "he")}.`;
    }
    return `Status: ${status}. Failed gates: ${gateList(failedGates, "en")}. Warning gates: ${gateList(warningGates, "en")}.`;
  };

  return {
    overallStatus,
    summaryHe: summaryFor("he"),
    summaryEn: summaryFor("en"),
    failedGates,
    warningGates,
    recommendedActions,
    likelyAffectedAreas,
  };
}
