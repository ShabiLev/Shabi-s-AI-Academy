import { toolCatalog, type AgentInput } from "../agents/types";
import type { PromptInput, PromptTestCase } from "../prompts/types";
export interface BuilderValidationIssue { field: string; code: string; severity: "error" | "warning" }
export function evaluatePromptDimensions(prompt: Partial<PromptInput>) {
  const dimensions = [
    ["taskClarity", prompt.task], ["contextQuality", prompt.context], ["constraints", prompt.constraints], ["outputDefinition", `${prompt.outputFormat ?? ""} ${prompt.outputSchema ?? ""}`],
    ["examples", prompt.examples], ["variables", prompt.variables], ["verification", prompt.validationRules], ["safety", prompt.safetyNotes], ["reuseReadiness", `${prompt.title ?? ""} ${(prompt.tags ?? []).join(" ")}`],
  ] as const;
  const checks = dimensions.map(([key, value]) => ({ key, score: value?.trim() ? (value.trim().length >= 20 ? 12 : 7) : 0 }));
  return { score: Math.min(100, checks.reduce((sum, check) => sum + check.score, 0)), checks };
}
export function evaluatePromptTestCase(test: PromptTestCase): PromptTestCase { const complete = Boolean(test.input.trim() && test.expectedCharacteristics.trim() && test.evaluationChecklist.length); return { ...test, status: complete && !test.forbiddenOutput.toLocaleLowerCase().includes("secret") ? "passed" : "failed" }; }
export function validateAdvancedAgent(agent: Partial<AgentInput>): BuilderValidationIssue[] {
  const issues: BuilderValidationIssue[] = []; const add = (field: string, code: string, severity: "error" | "warning" = "error") => issues.push({ field, code, severity });
  if (!agent.goal?.trim()) add("goal", "missing-goal"); if (!agent.completionCriteria?.trim()) add("completionCriteria", "missing-completion-criteria"); if (!agent.outputFormat?.trim() && !agent.outputSchema?.trim()) add("output", "unclear-output");
  const risky = (agent.tools ?? []).some((id) => toolCatalog.find((tool) => tool.id === id)?.risk === "high"); if (risky && !(agent.humanApprovalPoints?.length)) add("tools", "unsafe-write-tool-without-approval");
  if ((agent.retryPolicy?.maximumRetries ?? 0) > 0 && !agent.retryPolicy?.stopCondition.trim()) add("retryPolicy", "retry-without-stop-condition"); if ((agent.memoryStrategy === "longTerm" || agent.memoryStrategy === "custom") && !agent.riskNotes?.trim()) add("memoryStrategy", "excessive-memory-retention", "warning"); if (!agent.errorHandling?.trim()) add("errorHandling", "missing-error-handling", "warning");
  if ((agent.tools ?? []).some((tool) => /connected|live/i.test(tool))) add("tools", "connected-tool-claim"); return issues;
}
export function createFieldDiff(before: Record<string, unknown>, after: Record<string, unknown>, fields: readonly string[]) { return fields.filter((field) => JSON.stringify(before[field]) !== JSON.stringify(after[field])).map((field) => ({ field, before: String(before[field] ?? ""), after: String(after[field] ?? "") })); }

