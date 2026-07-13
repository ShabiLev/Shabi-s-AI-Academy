import { describe, expect, it } from "vitest";
import { assemblePrompt, estimateTokens, loadWorkspace, replacePromptVariables, saveBoundedWorkspace } from ".";

describe("playground domain", () => {
  it("replaces declared variables while leaving unknown placeholders visible", () => {
    expect(replacePromptVariables("Review {{input}} for {{missing}}", { input: "release" })).toBe("Review release for {{missing}}");
  });

  it("assembles deterministic reviewable sections and estimates tokens", () => {
    const value = assemblePrompt({ systemInstruction: "Be careful", userPrompt: "Review {{input}}", variables: { input: "this" }, context: "Local", constraints: "No network", outputFormat: "Table", examples: "Example" });
    expect(value).toContain("## System\nBe careful");
    expect(value).toContain("Review this");
    expect(estimateTokens(value)).toBeGreaterThan(1);
  });

  it("validates workspace schema and recovers from malformed local data", () => {
    expect(saveBoundedWorkspace("workspace", { value: "safe" })).toBe(true);
    expect(loadWorkspace("workspace", {})).toEqual({ value: "safe" });
    localStorage.setItem("workspace", "{");
    expect(loadWorkspace("workspace", { fallback: true })).toEqual({ fallback: true });
  });
});
