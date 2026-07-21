export function evaluateMainMergeReadiness({
  packageVersion,
  releaseVersion,
  releaseStatus,
  qualityStatus,
  knownIssues = [],
  evidenceIdentity = {},
  headCommit,
  evidenceIntegrityValid = false,
  workingTreeClean,
  linuxBaselineCount = 0,
}) {
  const blockers = [];
  if (packageVersion !== releaseVersion) blockers.push(`version mismatch: package=${packageVersion}, release=${releaseVersion}`);
  if (releaseStatus?.releaseState !== "ready" || releaseStatus?.mergeReadiness !== "ready") blockers.push("release state is not merge-ready");
  for (const [gate, status] of Object.entries(qualityStatus ?? {})) {
    if (["unit", "e2e", "visual", "accessibility", "performance", "pages", "aos"].includes(gate) && status !== "passed") blockers.push(`mandatory gate ${gate} is ${status}`);
  }
  const unapproved = Object.entries(qualityStatus?.manualReviews ?? {}).filter(([, review]) => review?.status !== "approved");
  if (unapproved.length) blockers.push(`manual reviews not approved: ${unapproved.map(([name]) => name).join(", ")}`);
  const severe = knownIssues.filter((issue) => issue.status === "active" && ["critical", "high"].includes(String(issue.severity).toLowerCase()));
  if (severe.length) blockers.push(`active Critical/High issues: ${severe.map((issue) => issue.id).join(", ")}`);
  if (!workingTreeClean) blockers.push("working tree is dirty");
  if (!evidenceIdentity.workingTreeCleanAtTest) blockers.push("evidence was not captured from a clean tested tree");
  if (!evidenceIdentity.testedCommit || (evidenceIdentity.testedCommit !== headCommit && !evidenceIntegrityValid)) blockers.push("tested commit is stale or lacks valid evidence-only lineage to HEAD");
  if (!evidenceIdentity.evidenceCommit) blockers.push("evidence commit is missing");
  if (linuxBaselineCount === 0) blockers.push("reviewed Linux visual baselines are missing");
  return { ready: blockers.length === 0, blockers };
}
