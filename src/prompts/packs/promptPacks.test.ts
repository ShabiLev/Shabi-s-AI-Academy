import { describe, expect, it } from "vitest";
import { findPackedCopies, importPackedPrompt, packedPrompts, promptPacks } from ".";

describe("prompt packs", () => {
  it("meets every pack minimum and contains exactly 250 unique prompts", () => {
    expect(packedPrompts).toHaveLength(250);
    expect(new Set(packedPrompts.map((prompt) => prompt.id)).size).toBe(250);
    for (const pack of promptPacks) {
      expect(packedPrompts.filter((prompt) => prompt.packId === pack.id)).toHaveLength(pack.count);
    }
  });

  it("has complete bilingual, reviewable, non-duplicated bodies", () => {
    const bodies = new Set<string>();
    for (const prompt of packedPrompts) {
      expect(prompt.title.he && prompt.title.en && prompt.description.he && prompt.description.en).toBeTruthy();
      expect(prompt.variables).toContain("input");
      expect(prompt.safetyNotes.he && prompt.safetyNotes.en).toBeTruthy();
      const body = `${prompt.role.en}\n${prompt.task.en}\n${prompt.outputFormat.en}`;
      expect(bodies.has(body)).toBe(false);
      bodies.add(body);
    }
  });

  it("imports one, selected entries, and a full pack as editable local copies", () => {
    const one = importPackedPrompt(packedPrompts[0], "en");
    const selected = packedPrompts.slice(1, 4).map((prompt) => importPackedPrompt(prompt, "he"));
    const pack = packedPrompts.filter((prompt) => prompt.packId === "security-risk").map((prompt) => importPackedPrompt(prompt, "en"));
    expect(one.version).toBe(1);
    expect(selected).toHaveLength(3);
    expect(pack).toHaveLength(10);
    expect(findPackedCopies([one], packedPrompts[0].id)).toEqual([one]);
  });
});
