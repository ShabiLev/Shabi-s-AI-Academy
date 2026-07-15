const localApproval =
  process.env.VISUAL_UPDATE_APPROVED === "1" && process.env.CI !== "true";
const controlledWorkflow =
  process.env.AOS_ALLOW_VISUAL_UPDATE === "1" &&
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
