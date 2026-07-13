import { describe, expect, it } from "vitest";
import { emptyAgent } from "../agents/types";
import { emptyInput, type PromptTestCase } from "../prompts/types";
import { createFieldDiff, evaluatePromptDimensions, evaluatePromptTestCase, validateAdvancedAgent } from "./advancedBuilders";
describe("advanced builders", () => {
  it("scores all prompt quality dimensions deterministically", () => { const result = evaluatePromptDimensions({ ...emptyInput, task: "A clear task with sufficient detail", context: "Useful context with sufficient detail", constraints: "Do not invent facts", outputFormat: "A structured table", validationRules: "Check every claim", safetyNotes: "Keep secrets out", variables: "{{input}}", examples: "Example", title: "Reusable prompt", tags: ["qa"] }); expect(result.checks).toHaveLength(9); expect(result.score).toBeGreaterThan(50); });
  it("labels deterministic prompt test cases", () => { const test: PromptTestCase = { id: "1", input: "requirement", expectedCharacteristics: "table", forbiddenOutput: "fabricated facts", evaluationChecklist: ["has IDs"], status: "draft" }; expect(evaluatePromptTestCase(test).status).toBe("passed"); });
  it("validates unsafe and incomplete agent configurations", () => { const issues = validateAdvancedAgent({ ...emptyAgent, tools: ["emailDraft"], retryPolicy: { ...emptyAgent.retryPolicy, maximumRetries: 2 } }); expect(issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(["missing-goal", "unsafe-write-tool-without-approval", "retry-without-stop-condition", "missing-error-handling"])); });
  it("creates field-level diffs", () => { expect(createFieldDiff({ goal: "a" }, { goal: "b" }, ["goal"])).toEqual([{ field: "goal", before: "a", after: "b" }]); });
});
