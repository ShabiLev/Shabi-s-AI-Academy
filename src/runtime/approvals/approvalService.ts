import type { ApprovalDecision, ApprovalRequest, RiskLevel } from "../types";

export function createApprovalRequest(input: {
  id: string;
  runId: string;
  requestedAt: string;
  riskLevel?: RiskLevel;
}): ApprovalRequest {
  return {
    id: input.id,
    runId: input.runId,
    title: "Approval required",
    description:
      "Review this simulated risky action before the local run continues.",
    riskLevel: input.riskLevel ?? "high",
    proposedAction: "Continue the simulated planned-tool step.",
    consequenceSummary:
      "No external action will occur; approval advances only this local Mock run.",
    required: true,
    requestedAt: input.requestedAt,
    decision: "pending",
    approverRole: "User",
  };
}
export function decideApproval(
  request: ApprovalRequest,
  decision: Exclude<ApprovalDecision, "pending">,
  decidedAt: string,
) {
  if (request.decision !== "pending") return request;
  return { ...request, decision, decidedAt };
}
