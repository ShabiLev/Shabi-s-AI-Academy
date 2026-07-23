import { execFileSync } from "node:child_process";
import { test, expect, login } from "../fixtures/academy";

/**
 * The app embeds its commit SHA at build time (see vite.config.ts and
 * src/quality/buildMetadata.ts). CI jobs must build against the exact
 * commit they claim to test, not GitHub's synthetic pull_request merge
 * commit — otherwise two jobs testing "the same" PR head SHA silently
 * build and render two different real commits, which previously caused
 * masked commit/build fields to render at slightly different widths
 * between candidate-generation and compare visual runs (see
 * docs/visual-regression.md). This must hold in every environment the
 * suite runs in, so no branch is skipped locally or in CI.
 */
test("served build reports the actual checked-out commit", async ({ page }) => {
  const actualHeadSha = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  await login(page, "/qa");
  const renderedCommit = await page
    .locator('[data-visual-mask="commit"]')
    .textContent();
  expect(renderedCommit?.trim()).toBe(actualHeadSha);
});
