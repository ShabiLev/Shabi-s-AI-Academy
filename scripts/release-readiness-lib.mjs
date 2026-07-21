export const REQUIRED_CI_JOBS = [
  "quality-core",
  "functional-e2e",
  "cross-browser",
  "accessibility",
  "performance",
  "visual-linux",
  "quality-summary",
];

export function selectExactRun(runs, expectedSha) {
  return [...(runs ?? [])]
    .filter((run) => run.head_sha === expectedSha)
    .sort((left, right) => Number(right.run_attempt ?? 1) - Number(left.run_attempt ?? 1) || Number(right.id) - Number(left.id))[0] ?? null;
}

export function evaluateWorkflowRun({ expectedSha, run, jobs = [], requiredJobs = REQUIRED_CI_JOBS }) {
  const blockers = [];
  if (!run) return { ready: false, blockers: [`no CI run exists for exact HEAD ${expectedSha}`] };
  if (run.head_sha !== expectedSha) blockers.push(`CI run SHA ${run.head_sha ?? "missing"} does not match HEAD ${expectedSha}`);
  if (run.status !== "completed") blockers.push(`CI run is ${run.status ?? "missing"}`);
  if (run.conclusion !== "success") blockers.push(`CI run conclusion is ${run.conclusion ?? "missing"}`);
  const byName = new Map(jobs.map((job) => [job.name, job]));
  for (const name of requiredJobs) {
    const job = byName.get(name);
    if (!job) blockers.push(`mandatory job ${name} is missing`);
    else if (job.status !== "completed") blockers.push(`mandatory job ${name} is ${job.status}`);
    else if (job.conclusion !== "success") blockers.push(`mandatory job ${name} is ${job.conclusion ?? "missing"}`);
  }
  return { ready: blockers.length === 0, blockers };
}
