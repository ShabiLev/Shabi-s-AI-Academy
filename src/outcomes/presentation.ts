import type { RealityMode as BadgeRealityMode } from "../components/outcomes/RealityBadge";
import type { EvidenceState } from "../components/outcomes/EvidenceStatus";
import type { LocalizedOutcomeText, OutcomeAction } from "../components/outcomes/types";
import type { Outcome, OutcomeNextAction, OutcomeVerificationState, RealityMode } from "./types";

export function toLocalizedOutcomeText(value: string): LocalizedOutcomeText {
  return { he: value, en: value };
}

export function outcomeNextActionToOutcomeAction(action: OutcomeNextAction): OutcomeAction {
  return { id: action.id, label: toLocalizedOutcomeText(action.label), href: action.route };
}

export function outcomeToLimitations(outcome: Pick<Outcome, "limitations">): LocalizedOutcomeText[] {
  return outcome.limitations.map(toLocalizedOutcomeText);
}

const REALITY_TO_BADGE: Record<RealityMode, BadgeRealityMode> = {
  live: "live",
  local: "local",
  simulated: "simulated",
  "blueprint-only": "blueprint",
  "manual-action-required": "manual",
  "not-connected": "notConnected",
};

export function outcomeRealityToBadgeMode(mode: RealityMode): BadgeRealityMode {
  return REALITY_TO_BADGE[mode];
}

export function outcomeVerificationToEvidenceState(outcome: Pick<Outcome, "status" | "verificationState">): EvidenceState {
  if (outcome.status === "blocked") return "blocked";
  const state: OutcomeVerificationState = outcome.verificationState;
  if (state === "verified") return "verified";
  if (state === "needs-evidence") return "needsEvidence";
  return "notVerified";
}
