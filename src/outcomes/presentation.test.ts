import { describe, expect, it } from "vitest";
import { REALITY_MODES } from "./types";
import { outcomeNextActionToOutcomeAction, outcomeRealityToBadgeMode, outcomeToLimitations, outcomeVerificationToEvidenceState } from "./presentation";

describe("outcome presentation mapping", () => {
  it("maps every domain reality mode to a shared badge mode without falling through", () => {
    for (const mode of REALITY_MODES) {
      expect(outcomeRealityToBadgeMode(mode)).toBeTruthy();
    }
    expect(outcomeRealityToBadgeMode("blueprint-only")).toBe("blueprint");
    expect(outcomeRealityToBadgeMode("manual-action-required")).toBe("manual");
    expect(outcomeRealityToBadgeMode("not-connected")).toBe("notConnected");
  });

  it("never reports verified without a verified evidence state, and honors blocked over verification", () => {
    expect(outcomeVerificationToEvidenceState({ status: "ready", verificationState: "unverified" })).toBe("notVerified");
    expect(outcomeVerificationToEvidenceState({ status: "needs-evidence", verificationState: "needs-evidence" })).toBe("needsEvidence");
    expect(outcomeVerificationToEvidenceState({ status: "verified", verificationState: "verified" })).toBe("verified");
    expect(outcomeVerificationToEvidenceState({ status: "blocked", verificationState: "verified" })).toBe("blocked");
  });

  it("adapts plain-string next actions and limitations into the shared bilingual shape without inventing a translation", () => {
    expect(outcomeNextActionToOutcomeAction({ id: "review", label: "Review evidence", route: "/outcomes/outcome-1" })).toEqual({
      id: "review", label: { he: "Review evidence", en: "Review evidence" }, href: "/outcomes/outcome-1",
    });
    expect(outcomeToLimitations({ limitations: ["Local only"] })).toEqual([{ he: "Local only", en: "Local only" }]);
  });
});
