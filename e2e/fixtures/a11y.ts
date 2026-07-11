import AxeBuilder from "@axe-core/playwright";
import type { Page, TestInfo } from "@playwright/test";
import { expect } from "@playwright/test";
import { a11yAllowlist } from "../../quality/config/a11yAllowlist";

interface AxeNode {
  target: string[];
}

interface AxeViolation {
  id: string;
  impact: string | null;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
}

function isAllowed(violation: AxeViolation, node: AxeNode): boolean {
  return a11yAllowlist.some(
    (allowed) =>
      allowed.ruleId === violation.id &&
      node.target.some((selector) => selector.includes(allowed.selector)),
  );
}

function formatViolation(v: AxeViolation): string {
  const selectors = v.nodes.map((n) => n.target.join(" ")).join(", ");
  return [
    `Rule: ${v.id}`,
    `Impact: ${v.impact ?? "unknown"}`,
    `Help: ${v.help}`,
    `Selectors: ${selectors}`,
    `More info: ${v.helpUrl}`,
  ].join("\n");
}

/**
 * Scans the current page with axe-core against WCAG 2.0/2.1 A and AA rules,
 * attaches the full JSON result to the Playwright report, and fails the test with
 * a readable summary if any violation is not covered by the typed allowlist.
 *
 * This does not replace keyboard-only testing, screen-reader testing, zoom
 * testing, or cognitive usability review — see docs/manual-qa-checklist.md.
 */
export async function runAxeScan(
  page: Page,
  testInfo: TestInfo,
  options?: { include?: string; label?: string },
): Promise<void> {
  let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]);
  if (options?.include) builder = builder.include(options.include);
  const results = await builder.analyze();

  await testInfo.attach(`axe-${options?.label ?? testInfo.title}.json`, {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });

  const unexpected = results.violations.filter(
    (violation) => !violation.nodes.every((node) => isAllowed(violation, node)),
  );

  const summary = unexpected.map(formatViolation).join("\n\n");
  expect(unexpected, summary ? `Unexpected accessibility violations:\n\n${summary}` : undefined).toEqual([]);
}
