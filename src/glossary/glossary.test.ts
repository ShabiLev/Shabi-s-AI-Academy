import { describe, expect, it } from "vitest";
import { getGlossaryTerm, glossaryTerms } from "./glossaryData";

describe("bilingual glossary", () => {
  it("contains every required term with definitions, examples, and related destinations", () => {
    expect(glossaryTerms).toHaveLength(23);
    expect(glossaryTerms.every((term) => term.name.he && term.name.en && term.definition.he && term.definition.en && term.example.he && term.example.en && term.relatedLesson.startsWith("/") && term.relatedFeature.startsWith("/"))).toBe(true);
  });
  it("states connection availability for concepts that could imply a live service", () => {
    expect(getGlossaryTerm("live-run")?.availability?.en).toContain("no live connection");
    expect(getGlossaryTerm("cloud-sync")?.availability?.he).toBeTruthy();
  });
});
