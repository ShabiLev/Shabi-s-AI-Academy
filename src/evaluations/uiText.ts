export type EvaluationLanguage = "he" | "en";

export type EvaluationCopy = {
  he: string;
  en: string;
};

export const evaluationText = (language: EvaluationLanguage, text: EvaluationCopy) => text[language];

export const academyEvaluationLabel: EvaluationCopy = {
  he: "הערכת Academy דטרמיניסטית",
  en: "Academy deterministic evaluation",
};

export const evaluationStatusText: Record<string, EvaluationCopy> = {
  draft: { he: "טיוטה", en: "Draft" },
  ready: { he: "מוכנה", en: "Ready" },
  running: { he: "פועלת", en: "Running" },
  paused: { he: "מושהית", en: "Paused" },
  "needs-evidence": { he: "נדרשות ראיות", en: "Needs evidence" },
  completed: { he: "הושלמה", en: "Completed" },
  cancelled: { he: "בוטלה", en: "Cancelled" },
  blocked: { he: "חסומה", en: "Blocked" },
};

export const demoCompetitors = [
  {
    name: { he: "סוכן React נגיש — גרסה 1.3", en: "Accessible React Agent — version 1.3" },
    score: 86,
    status: { he: "עבר", en: "Pass" },
    confidence: { he: "ביטחון גבוה", en: "High confidence" },
    evidence: 12,
    retries: 1,
  },
  {
    name: { he: "סוכן React בסיסי — גרסה 1.2", en: "Baseline React Agent — version 1.2" },
    score: 72,
    status: { he: "חלקי", en: "Partial" },
    confidence: { he: "ביטחון בינוני", en: "Medium confidence" },
    evidence: 9,
    retries: 2,
  },
] as const;

export const demoCriteria = [
  { name: { he: "עמידה בדרישות", en: "Requirements coverage" }, weight: 30, first: 27, second: 24, evidence: 4 },
  { name: { he: "נגישות", en: "Accessibility" }, weight: 25, first: 23, second: 15, evidence: 5 },
  { name: { he: "איכות קוד", en: "Code quality" }, weight: 25, first: 20, second: 19, evidence: 4 },
  { name: { he: "בדיקות", en: "Testing" }, weight: 20, first: 16, second: 14, evidence: 3 },
] as const;

export const displayRunName: EvaluationCopy = {
  he: "השוואת מימוש React נגיש",
  en: "Accessible React implementation comparison",
};
