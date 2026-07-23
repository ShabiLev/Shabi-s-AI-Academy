import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const actualCommit = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const expectedCommit = process.env.EXPECTED_DEPLOY_SHA || actualCommit;
if (actualCommit !== expectedCommit) {
  throw new Error(`Deployment checkout ${actualCommit} does not match tested commit ${expectedCommit}.`);
}
writeFileSync(
  new URL("../dist/deployment-commit.json", import.meta.url),
  `${JSON.stringify({ testedCommit: expectedCommit, deployedArtifactCommit: actualCommit }, null, 2)}\n`,
  "utf8",
);
console.log(`Recorded deployment artifact commit ${actualCommit}.`);
