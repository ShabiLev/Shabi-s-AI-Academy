import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * The visual-linux-candidates job exists to generate reviewable screenshots
 * for a human, not to gate merge — so a pixel mismatch against a stale or
 * about-to-be-replaced baseline is an expected, healthy outcome, not a job
 * failure. But a real Playwright error (a selector that never resolved, a
 * timeout, a crashed browser, an application error) means the candidates
 * produced can't be trusted at all, and that must still fail the job loudly.
 *
 * This script reads the job's own Playwright JSON report and draws that
 * line: exit 0 (with a summary) if every failure is a screenshot-mismatch
 * assertion, exit 1 (naming the offending tests) if anything else failed.
 */

const root = resolve(import.meta.dirname, "../..");
const reportPath = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(root, "quality/generated/playwright-visual-results.json");

const SCREENSHOT_MISMATCH_PATTERN =
  /toHaveScreenshot|toMatchSnapshot|screenshot comparison failed|pixels?\s*\(ratio/i;

function flattenTests(suites, inherited = []) {
  const rows = [];
  for (const suite of suites ?? []) {
    const titles = [...inherited, suite.title].filter(Boolean);
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        for (const result of test.results ?? []) {
          rows.push({
            title: [...titles, spec.title].filter(Boolean).join(" > "),
            status: result.status,
            errors: [result.error, ...(result.errors ?? [])].filter(Boolean),
          });
        }
      }
    }
    rows.push(...flattenTests(suite.suites, titles));
  }
  return rows;
}

function isScreenshotMismatch(row) {
  if (row.status === "timedOut") return false;
  if (!row.errors.length) return false;
  return row.errors.every((error) => SCREENSHOT_MISMATCH_PATTERN.test(error.message ?? ""));
}

if (!existsSync(reportPath)) {
  console.error(`No Playwright report found at ${reportPath} — cannot classify candidate-generation results.`);
  process.exit(1);
}

const report = JSON.parse(readFileSync(reportPath, "utf8"));
const tests = flattenTests(report.suites);
const failed = tests.filter((row) => row.status !== "passed" && row.status !== "skipped");
const mismatches = failed.filter(isScreenshotMismatch);
const realFailures = failed.filter((row) => !isScreenshotMismatch(row));

console.log(`Candidate generation: ${tests.length} tests, ${failed.length} not passed.`);
if (mismatches.length) {
  console.log(`  ${mismatches.length} are screenshot mismatches (expected — candidates need review):`);
  for (const row of mismatches) console.log(`    - ${row.title}`);
}
if (realFailures.length) {
  console.error(`  ${realFailures.length} are NOT screenshot mismatches (real failures — job must fail):`);
  for (const row of realFailures) {
    console.error(`    - ${row.title} [${row.status}]: ${row.errors[0]?.message?.split("\n")[0] ?? "no error message"}`);
  }
  process.exit(1);
}

console.log("No non-screenshot failures — candidate generation succeeded.");
