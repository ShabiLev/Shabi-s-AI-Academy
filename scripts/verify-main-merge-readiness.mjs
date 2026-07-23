import { execFileSync } from "node:child_process";
import { evaluateWorkflowRun, selectExactRun } from "./release-readiness-lib.mjs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const head = git("rev-parse", "HEAD");
const branch = git("branch", "--show-current");
const allowedBranches = new Set(["main", "fix/1.4.0-ci-memory-visual-release"]);
const blockers = [];
if (git("status", "--porcelain=v1")) blockers.push("working tree is dirty");
if (!allowedBranches.has(branch)) blockers.push(`branch ${branch || "detached"} is not an allowed release context`);

const remote = git("remote", "get-url", "origin");
const match = remote.match(/github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/i);
if (!match) blockers.push("origin is not a supported GitHub repository URL");

if (!blockers.length) {
  const repository = `${match[1]}/${match[2]}`;
  const headers = { Accept: "application/vnd.github+json", "User-Agent": "shabis-ai-academy-release-readiness", "X-GitHub-Api-Version": "2022-11-28" };
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const request = async (url) => {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
      return response.json();
    };
    const encodedBranch = encodeURIComponent(branch);
    const runsPayload = await request(`https://api.github.com/repos/${repository}/actions/workflows/ci.yml/runs?branch=${encodedBranch}&per_page=100`);
    const run = selectExactRun(runsPayload.workflow_runs, head);
    const jobs = run ? (await request(`https://api.github.com/repos/${repository}/actions/runs/${run.id}/jobs?per_page=100`)).jobs : [];
    const result = evaluateWorkflowRun({ expectedSha: head, run, jobs });
    blockers.push(...result.blockers);
    if (!blockers.length) {
      console.log(`Main merge readiness passed for exact HEAD ${head}; CI run ${run.id}.`);
      process.exit(0);
    }
  } catch (error) {
    blockers.push(`GitHub status is unverified: ${error.message}`);
  }
}

console.error(`Main merge readiness BLOCKED:\n- ${blockers.join("\n- ")}`);
process.exit(1);
