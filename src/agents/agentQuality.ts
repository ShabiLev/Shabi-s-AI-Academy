import { toolCatalog, type AgentInput } from "./types";
export interface AgentQuality {
  score: number;
  label: "needsWork" | "foundation" | "strong" | "excellent";
  checks: { key: string; earned: number; max: number }[];
  disclaimer: string;
}
export function evaluateAgent(a: Partial<AgentInput>): AgentQuality {
  const has = (v?: string, n = 1) =>
      Boolean(v?.trim().length && v.trim().length >= n),
    risky = (a.tools ?? []).some(
      (id) => toolCatalog.find((t) => t.id === id)?.risk === "high",
    ),
    checks = [
      {
        key: "goal",
        earned: has(a.goal, 20) ? 15 : has(a.goal) ? 7 : 0,
        max: 15,
      },
      { key: "inputs", earned: has(a.inputs) ? 10 : 0, max: 10 },
      {
        key: "instructions",
        earned: has(a.instructions, 30) ? 15 : has(a.instructions) ? 7 : 0,
        max: 15,
      },
      { key: "tools", earned: (a.tools?.length ?? 0) > 0 ? 10 : 0, max: 10 },
      {
        key: "validation",
        earned: has(a.validationRules, 10) ? 15 : 0,
        max: 15,
      },
      { key: "output", earned: has(a.outputFormat) ? 10 : 0, max: 10 },
      {
        key: "completion",
        earned: has(a.completionCriteria) ? 10 : 0,
        max: 10,
      },
      {
        key: "retry",
        earned:
          (a.retryPolicy?.maximumRetries ?? 0) >= 0 &&
          Boolean(
            a.retryPolicy?.stopCondition || a.retryPolicy?.maximumRetries === 0,
          )
            ? 5
            : 0,
        max: 5,
      },
      {
        key: "approval",
        earned: !risky || (a.humanApprovalPoints?.length ?? 0) > 0 ? 5 : 0,
        max: 5,
      },
      {
        key: "specificity",
        earned: has(a.name, 4) && has(a.goal, 20) ? 5 : 0,
        max: 5,
      },
    ],
    score = Math.min(
      100,
      checks.reduce((s, c) => s + c.earned, 0),
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
    disclaimer:
      "Structural design score only; it does not prove production readiness, permissions, security, or real-world execution.",
  };
}
