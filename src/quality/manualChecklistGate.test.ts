import { beforeEach, describe, expect, it } from "vitest";
import { manualChecklistKeys } from "./checklist";
import {
  getManualChecklistGateStatus,
  QA_CHECKLIST_STORAGE_KEY,
  saveChecklistForVersion,
} from "./qualityStorage";

describe("manualChecklist gate", () => {
  beforeEach(() => localStorage.clear());
  it("is notRun when no versioned checklist exists", () => {
    expect(getManualChecklistGateStatus("0.6.0")).toBe("notRun");
  });
  it("is warning while incomplete and passed when complete", () => {
    saveChecklistForVersion({
      applicationVersion: "0.6.0",
      manualChecks: {},
      updatedAt: "",
    });
    expect(getManualChecklistGateStatus("0.6.0")).toBe("warning");
    saveChecklistForVersion({
      applicationVersion: "0.6.0",
      manualChecks: Object.fromEntries(
        manualChecklistKeys.map((key) => [key, true]),
      ),
      updatedAt: "",
    });
    expect(getManualChecklistGateStatus("0.6.0")).toBe("passed");
  });
  it("is notAvailable for malformed persisted data", () => {
    localStorage.setItem(
      QA_CHECKLIST_STORAGE_KEY,
      JSON.stringify({ "0.6.0": { manualChecks: null } }),
    );
    expect(getManualChecklistGateStatus("0.6.0")).toBe("notAvailable");
  });
});
