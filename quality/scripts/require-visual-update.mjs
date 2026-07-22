const localApproval =
  process.env.VISUAL_UPDATE_APPROVED === "1" && process.env.CI !== "true";
const controlledWorkflow =
  process.env.VISUAL_UPDATE_APPROVED === "1" &&
  process.env.VISUAL_UPDATE_CONTEXT === "reviewed-linux-workflow" &&
  process.env.VISUAL_BASELINE_MODE === "generate-candidates" &&
  process.env.CI === "true" &&
  process.env.GITHUB_EVENT_NAME === "workflow_dispatch";

if (!localApproval && !controlledWorkflow) {
  console.error(
    "Visual baseline updates require local VISUAL_UPDATE_APPROVED=1 or the confirmed manual GitHub workflow.",
  );
  process.exit(1);
}
console.log(
  controlledWorkflow
    ? "Controlled CI baseline generation enabled."
    : "Explicit local visual baseline update approval detected.",
);
