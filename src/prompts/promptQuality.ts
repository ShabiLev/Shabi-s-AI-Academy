import type { PromptInput } from "./types";
export interface QualityResult {
  score: number;
  label: "needsWork" | "foundation" | "strong" | "excellent";
  checks: { key: string; earned: number; max: number }[];
}
export function evaluatePrompt(p: Partial<PromptInput>): QualityResult {
  const meaningful = (s?: string, n = 1) => Boolean(s && s.trim().length >= n),
    checks = [
      {
        key: "task",
        earned: meaningful(p.task, 20) ? 25 : meaningful(p.task) ? 12 : 0,
        max: 25,
      },
      {
        key: "context",
        earned: meaningful(p.context, 20) ? 20 : meaningful(p.context) ? 10 : 0,
        max: 20,
      },
      {
        key: "constraints",
        earned: meaningful(p.constraints, 10)
          ? 15
          : meaningful(p.constraints)
            ? 7
            : 0,
        max: 15,
      },
      {
        key: "output",
        earned: meaningful(p.outputFormat, 8)
          ? 20
          : meaningful(p.outputFormat)
            ? 10
            : 0,
        max: 20,
      },
      {
        key: "reusable",
        earned:
          meaningful(p.title, 5) &&
          (meaningful(p.role) || meaningful(p.context))
            ? 10
            : 0,
        max: 10,
      },
      {
        key: "specific",
        earned:
          meaningful(p.task, 50) ||
          ((p.tags?.length ?? 0) > 0 && meaningful(p.description))
            ? 10
            : 0,
        max: 10,
      },
    ],
    score = Math.min(
      100,
      checks.reduce((sum, c) => sum + c.earned, 0),
    );
  return {
    score,
    label:
      score < 40
        ? "needsWork"
        : score < 70
          ? "foundation"
          : score < 90
            ? "strong"
            : "excellent",
    checks,
  };
}
