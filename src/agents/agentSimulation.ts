import type { Agent } from "./types";
export type SimulationScenario =
  | "success"
  | "validationFailure"
  | "retry"
  | "approval"
  | "maxRetries"
  | "incomplete";
export interface SimulationStep {
  sequence: number;
  stage: string;
  action: string;
  result: string;
  validation: "passed" | "failed" | "notRun";
  decision: string;
  warning?: string;
}
export function simulateAgent(
  agent: Agent,
  scenario: SimulationScenario,
  input: string,
): SimulationStep[] {
  const stages = [
    "Goal received",
    "Inputs validated",
    "Plan created",
    "Tool selected",
    "Action simulated",
    "Result observed",
    "Validation applied",
  ];
  const steps = stages.map((stage, i): SimulationStep => ({
    sequence: i + 1,
    stage,
    action:
      i === 0
        ? agent.goal
        : i === 1
          ? `Validate sample input: ${input || "(empty)"}`
          : "Deterministic simulation step",
    result:
      i === 3
        ? agent.tools.join(", ") || "No external tools"
        : "Simulated result only",
    validation:
      scenario === "validationFailure" && i === 6
        ? "failed"
        : i < 6
          ? "notRun"
          : "passed",
    decision: "Continue",
    ...(i === 3 && agent.tools.some((t) => t !== "none")
      ? { warning: "Tool not connected — no external call was made." }
      : {}),
  }));
  if (scenario === "approval" || agent.humanApprovalPoints.length)
    steps.push({
      sequence: steps.length + 1,
      stage: "Human approval requested",
      action: "Pause for declared approver",
      result: "Approval is simulated, not sent",
      validation: "notRun",
      decision: scenario === "approval" ? "Await approval" : "Continue",
    });
  if (scenario === "retry" || scenario === "maxRetries")
    steps.push({
      sequence: steps.length + 1,
      stage: "Retry evaluated",
      action: "Apply retry policy without waiting",
      result:
        scenario === "maxRetries"
          ? "Maximum retries reached"
          : "Retry simulated",
      validation: "notRun",
      decision: scenario === "maxRetries" ? "Stop" : "Retry",
    });
  steps.push({
    sequence: steps.length + 1,
    stage: "Completion criteria checked",
    action: agent.completionCriteria,
    result:
      scenario === "incomplete"
        ? "Criteria not met"
        : "Criteria simulated as met",
    validation: scenario === "incomplete" ? "failed" : "passed",
    decision:
      scenario === "incomplete" ||
      scenario === "validationFailure" ||
      scenario === "maxRetries"
        ? "Stopped"
        : "Finished",
  });
  return steps;
}
