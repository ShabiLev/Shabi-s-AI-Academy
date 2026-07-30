import { deterministicHash } from "./hash";
import type { EvaluationSuite } from "./types";
import type { RegressionSuiteCaseInput } from "./regression";

export const REACT_ACCESSIBILITY_SUITE_ID = "react-accessibility";

export function createReactAccessibilitySuite(now: string): EvaluationSuite {
  return {
    schemaVersion: 1,
    id: REACT_ACCESSIBILITY_SUITE_ID,
    name: "React accessibility before publication",
    missionSnapshotIds: ["keyboard-operation", "accessible-names", "mobile-webkit", "focus-after-dialog"],
    rubricId: "accessibility-review",
    baselineEntityRefs: [{
      entityId: "accessible-react-agent",
      version: "1.2",
      contentHash: deterministicHash({ entityId: "accessible-react-agent", version: "1.2" }),
    }],
    status: "ready",
    createdAt: now,
    updatedAt: now,
    runHistory: [],
  };
}

export const reactAccessibilityCases: readonly RegressionSuiteCaseInput[] = [
  { caseId: "keyboard-operation", baselineScore: 80, candidateScore: 90, evidenceIds: ["evidence-keyboard-current"] },
  { caseId: "accessible-names", baselineScore: 90, candidateScore: 90, evidenceIds: ["evidence-names-current"] },
  { caseId: "mobile-webkit", baselineScore: 85, candidateScore: undefined, evidenceIds: [], critical: true },
  { caseId: "focus-after-dialog", baselineScore: 95, candidateScore: 70, evidenceIds: ["evidence-focus-current"], critical: true },
];
