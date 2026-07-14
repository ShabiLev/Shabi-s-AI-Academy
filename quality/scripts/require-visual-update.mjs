if (process.env.VISUAL_UPDATE_APPROVED !== "1") {
  console.error("Visual baseline updates require VISUAL_UPDATE_APPROVED=1 after checklist and human screenshot review.");
  process.exit(1);
}
console.log("Explicit visual baseline update approval detected.");
