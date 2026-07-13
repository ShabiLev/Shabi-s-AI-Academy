import { normalizeSearchText } from "../search";
import type { AssistantIntent } from "./types";
const patterns: Array<[AssistantIntent, RegExp]> = [
  ["createProject", /\b(create|new)\b.*\bproject\b|(?:צור|יצירת|חדש).*פרויקט/u], ["createPrompt", /\b(create|new)\b.*\bprompt\b|(?:צור|יצירת).*פרומפט/u], ["createAgent", /\b(create|new)\b.*\bagent\b|(?:צור|יצירת).*סוכנ/u],
  ["findPrompt", /\b(find|search|which)\b.*\bprompt\b|(?:מצא|חפש|איזה).*פרומפט/u], ["findAgent", /\b(find|search|which)\b.*\bagent\b|(?:מצא|חפש|איזה).*סוכנ/u], ["findLesson", /\b(find|search)\b.*\blesson\b|(?:מצא|חפש).*שיעור/u],
  ["explainScreen", /explain.*(screen|page)|(?:הסבר|תסביר).*(מסכ|עמוד)/u], ["showRecentActivity", /recent activity|פעילות אחרונה/u], ["showProjectContents", /project contents|תוכן הפרויקט/u],
  ["startMockRun", /(?:start|run).*mock|הרצ.*mock/u], ["startDryRun", /(?:start|run).*dry run|הרצ.*dry run/u], ["openQaReport", /(?:open|show).*qa|(?:פתח|הצג).*qa/u],
  ["exportWorkspace", /export.*workspace|(?:ייצא|יצוא).*סביב/u], ["showHelp", /\bhelp\b|עזרה/u], ["openRoute", /\bopen\b|^פתח/u],
];
export function classifyIntent(input: string): AssistantIntent { const value = normalizeSearchText(input).slice(0, 1000); return patterns.find(([, pattern]) => pattern.test(value))?.[0] ?? "unsupported"; }
