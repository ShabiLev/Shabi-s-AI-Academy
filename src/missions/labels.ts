import type { AgentPermission, ExecutionLevel, GuidanceMode, MissionPhaseStatus, MissionStatus, SkillLevel } from "./types";

type Language = "he" | "en";

const label = (language: Language, he: string, en: string) => language === "he" ? he : en;

export const missionStatusLabel = (status: MissionStatus, language: Language): string => ({
  draft: label(language, "טיוטה", "Draft"),
  "awaiting-plan-approval": label(language, "ממתינה לאישור תכנית", "Awaiting plan approval"),
  ready: label(language, "מוכנה להתחלה", "Ready"),
  running: label(language, "פעילה", "Running"),
  paused: label(language, "מושהית", "Paused"),
  "needs-input": label(language, "נדרש קלט", "Needs input"),
  "needs-work": label(language, "נדרש תיקון", "Needs work"),
  completed: label(language, "הושלמה", "Completed"),
  cancelled: label(language, "בוטלה", "Cancelled"),
  blocked: label(language, "חסומה", "Blocked"),
})[status];

export const permissionLabel = (permission: AgentPermission, language: Language): string => ({
  observe: label(language, "צפייה", "Observe"),
  recommend: label(language, "המלצה", "Recommend"),
  plan: label(language, "תכנון", "Plan"),
  implement: label(language, "יישום", "Implement"),
  validate: label(language, "אימות", "Validate"),
  approve: label(language, "אישור", "Approve"),
  "execute-local": label(language, "ביצוע מקומי", "Local execution"),
  "execute-connected": label(language, "ביצוע מחובר", "Connected execution"),
})[permission];

export const executionLabel = (level: ExecutionLevel, language: Language): string => ({
  explain: label(language, "הסבר בלבד", "Explain"),
  simulate: label(language, "סימולציה", "Simulate"),
  "dry-run": label(language, "הרצה יבשה", "Dry Run"),
  "local-execute": label(language, "ביצוע מקומי", "Local Execute"),
  "connected-execute": label(language, "ביצוע מחובר", "Connected Execute"),
})[level];

export const guidanceLabel = (mode: GuidanceMode, language: Language): string => ({
  teach: label(language, "למידה", "Teach"),
  guided: label(language, "מודרך", "Guided"),
  expert: label(language, "מומחה", "Expert"),
  "audit-only": label(language, "ביקורת בלבד", "Audit Only"),
})[mode];

export const skillLevelLabel = (level: SkillLevel, language: Language): string => ({
  "not-introduced": label(language, "טרם הוצגה", "Not introduced"),
  introduced: label(language, "הוצגה", "Introduced"),
  practised: label(language, "בתהליך תרגול", "Practised"),
  demonstrated: label(language, "הודגמה", "Demonstrated"),
  mastered: label(language, "נרכשה", "Mastered"),
  "needs-reinforcement": label(language, "דורשת חיזוק", "Needs reinforcement"),
})[level];

export const phaseStatusLabel = (status: MissionPhaseStatus, language: Language): string => ({
  pending: label(language, "ממתין", "Pending"),
  active: label(language, "פעיל", "Active"),
  passed: label(language, "עבר", "Passed"),
  failed: label(language, "נכשל", "Failed"),
  paused: label(language, "מושהה", "Paused"),
  skipped: label(language, "דולג", "Skipped"),
})[status];

export const gateLabel = (gate: string, language: Language): string => ({
  "interpretation-reviewed": label(language, "סקירת פירוש", "Interpretation review"),
  "human-plan-approval": label(language, "אישור תכנית אנושי", "Human plan approval"),
  "independent-validation": label(language, "אימות עצמאי", "Independent validation"),
  "evidence-pass": label(language, "ראיות עוברות", "Passing evidence"),
  "learning-summary": label(language, "סיכום למידה", "Learning summary"),
  "read-only-evidence": label(language, "ראיות לקריאה בלבד", "Read-only evidence"),
})[gate] ?? label(language, "שער איכות מוגדר", "Defined quality gate");

export const phaseInputLabel = (input: string, language: Language): string => ({
  "Reviewed interpretation": label(language, "פירוש שנבדק", "Reviewed interpretation"),
  "Approved plan": label(language, "תכנית מאושרת", "Approved plan"),
  "Implementation handoff": label(language, "מסירת תוצר ליישום", "Implementation handoff"),
  "Validated evidence": label(language, "ראיות שאומתו", "Validated evidence"),
})[input] ?? input;

export const evidenceKindLabel = (kind: string, language: Language): string => ({
  interpretation: label(language, "פירוש", "Interpretation"),
  plan: label(language, "תכנית", "Plan"),
  handoff: label(language, "מסירה", "Handoff"),
  gate: label(language, "שער איכות", "Quality gate"),
  learning: label(language, "למידה", "Learning"),
  system: label(language, "מערכת", "System"),
})[kind] ?? label(language, "ראיה", "Evidence");

export const blockedReasonLabel = (reason: string, language: Language): string => ({
  "quality-gate-failed": label(language, "שער האיכות נכשל; נדרש תיקון לפני המשך.", "The quality gate failed; correction is required before continuing."),
  "execution-level-unavailable": label(language, "ביצוע מחובר אינו זמין ולא בוצעה פעולה חיצונית.", "Connected execution is unavailable and no external action occurred."),
  "resume-drift": label(language, "המצב השתנה מאז ההשהיה; נדרש קלט לפני המשך.", "State changed after pause; input is required before continuing."),
})[reason] ?? label(language, "הפעולה נחסמה בבטחה.", "The action was safely blocked.");
