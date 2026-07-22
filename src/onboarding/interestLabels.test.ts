import { describe, expect, it } from "vitest";
import { interestDisplayLabel, interestLabels, interests } from "./interestLabels";

describe("interest display labels", () => {
  it("provides complete bilingual labels without exposing canonical IDs", () => {
    expect(Object.keys(interestLabels).sort()).toEqual([...interests].sort());
    for (const interest of interests) {
      expect(interestDisplayLabel(interest, "he")).not.toBe(interest);
      expect(interestDisplayLabel(interest, "en")).not.toBe(interest);
      expect(interestLabels[interest].he.trim()).not.toBe("");
      expect(interestLabels[interest].en.trim()).not.toBe("");
    }
    expect(interestDisplayLabel("promptEngineering", "he")).toBe("הנדסת פרומפטים");
    expect(interestDisplayLabel("promptEngineering", "en")).toBe("Prompt Engineering");
  });

  it("humanizes unknown identifiers without changing stored canonical values", () => {
    expect(interestDisplayLabel("contextEngineering", "en")).toBe("Context Engineering");
    expect(interestDisplayLabel("workflow_automation", "he")).toBe("Workflow Automation");
  });
});
