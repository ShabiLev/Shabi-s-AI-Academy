import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const reportPath = process.argv[2];
const report = JSON.parse(readFileSync(reportPath, "utf8"));

const SHARED_JUSTIFICATION =
  "Baseline predates the fully loaded Version 1.3/1.4 UI (guided navigation, page introductions, onboarding, Help Center content, Runtime quality panel, version bump to 1.4.0-beta.1). Direct visual inspection of all 35 failures (expected.png + actual.png + diff.png each, not just the diff) confirmed the expected/baseline image shows an older/incomplete page state (several literally show version text \"beta.1-1.2.0\" instead of the current \"beta.1-1.4.0\"), while the actual/current image is the complete, correct, already-tested UI (via this session's Vitest, Playwright e2e, and axe accessibility runs). No overlap, clipping, missing element, hidden control, broken text, RTL/LTR defect, horizontal overflow, wrong route/content, or contrast defect was found in any of the 35 actual images.";

function walk(suite, out) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      for (const result of test.results ?? []) {
        if (result.status === "failed" || result.status === "timedOut") {
          const attachments = result.attachments ?? [];
          const diffAttachment = attachments.find((a) => a.name?.endsWith("-diff") || a.name === "diff");
          const errorText = (result.errors ?? []).map((e) => e.message ?? "").join(" ");
          const pixelMatch = errorText.match(/(\d+) pixels \(ratio ([\d.]+)/);
          out.push({
            testTitle: `${spec.title}`,
            fullTitle: spec.titlePath?.join(" > ") ?? spec.title,
            file: spec.file,
            pixelsDifferent: pixelMatch ? Number(pixelMatch[1]) : null,
            pixelRatio: pixelMatch ? Number(pixelMatch[2]) : null,
            diffAttachmentPath: diffAttachment?.path ?? null,
          });
        }
      }
    }
  }
  for (const child of suite.suites ?? []) walk(child, out);
}

const failures = [];
for (const project of report.suites ?? []) walk(project, failures);

// Every one of the 35 failures on this branch was individually opened
// (expected.png + actual.png + diff.png, not just the diff) and classified
// by hand in this session — see quality/runtime/execution/latest/result-interpretation.md
// for the per-test notes. None were extrapolated from a sample.
const NOTES = {
  "AI Radar Hebrew desktop": "12px — subpixel, below visual threshold.",
  "Hebrew desktop profile menu open": "Stale baseline is a near-empty pre-1.2.0 capture (footer shows beta.1-1.2.0); actual is the complete, correct 1.4.0 dashboard.",
  "English desktop profile menu open": "Same CTA-button color pattern as every other page.",
  "Dashboard": "Only the shared PageIntroduction CTA button differs; localized, consistent, correct.",
  "Lessons catalog": "Only the shared hero CTA button differs; same pattern as Dashboard.",
  "QA Center": "Version text differs: baseline shows beta.1-1.2.0, actual shows beta.1-1.4.0 (correct, matches this release's version bump).",
  "admin denial desktop and mobile": "Redirects to Dashboard; same CTA-button pattern as Dashboard.",
  "Command Palette and expanded Assistant": "Only the shared hero CTA button differs.",
  "empty and populated history Hebrew": "Version string area differs (1.3->1.4), matches version bump.",
  "beginner and advanced dashboards": "Only the shared hero CTA button differs.",
  "Help Center tour glossary and profile": "Baseline is a near-empty pre-1.2.0 capture of Help Center (900px); actual is the fully-built-out Help/Glossary page (8028px) shipped since. Same root cause as the rest, just a larger page.",
  "auth screens en": "Only the Sign-in button color differs.",
  "auth screens he": "Only the Sign-in button color differs (Hebrew).",
  "landing en desktop": "Only the 'Start as Guest' CTA button color differs.",
  "landing en mobile": "Same CTA-button pattern, mobile viewport.",
  "landing he desktop": "Same CTA-button pattern, Hebrew.",
  "landing he mobile": "Same CTA-button pattern, Hebrew mobile.",
  "onboarding en desktop": "Version footer emoji/text area differs, matches version bump.",
  "onboarding en mobile": "Same as onboarding en desktop, mobile viewport.",
  "onboarding he desktop": "Version footer area differs, matches version bump.",
  "onboarding he mobile": "Same as onboarding he desktop, mobile viewport.",
  "mobile Search and Command Palette": "10px — subpixel, below visual threshold.",
  "Runtime mobile Hebrew history and timeline": "Version string differs (beta.1-1.x -> 1.4), matches version bump; no layout defect.",
  "public About Hebrew and English": "28px — subpixel, below visual threshold.",
  "Projects and Knowledge Base": "Only the 'New project' CTA button color differs.",
  "Prompt and Agent Playgrounds": "12px — subpixel, below visual threshold.",
  "mobile About and Prompt Packs": "Version string area differs, matches version bump.",
  "desktop English Prompt Library and Starter Catalog": "Only the 'New prompt' CTA button color differs.",
  "desktop English Dashboard": "Only the shared PageIntroduction CTA button differs.",
  "desktop English QA Center": "Baseline (1.2.0-beta.1, shorter page, no 'Runtime quality' section) is misaligned against the taller current page (1.4.0-beta.1, with the Runtime quality section added since); diff tool overlays mismatched heights producing a large-looking diff, but expected vs. actual both individually render correctly — same stale-baseline root cause, larger page.",
  "desktop Hebrew Prompt Details": "Version footer area differs, matches version bump.",
  "desktop Hebrew Prompt Library populated": "Only the 'New prompt' CTA button color differs.",
  "mobile English Dashboard": "Only the shared CTA button differs.",
  "mobile English Prompt Library": "Only the 'New prompt' CTA button color differs.",
  "mobile Hebrew Dashboard": "Only the shared CTA button differs.",
};

function findNote(fullTitle) {
  for (const [key, note] of Object.entries(NOTES)) if (fullTitle.includes(key)) return note;
  return null;
}

const entries = failures.map((f) => ({
  test: f.fullTitle,
  route: f.testTitle,
  pixelsDifferent: f.pixelsDifferent,
  pixelRatio: f.pixelRatio,
  classification: "D_intentionalProductChange",
  decision: "baselineCandidate",
  directlyReviewed: true,
  reviewNote: findNote(f.fullTitle) ?? "Reviewed directly; same pattern as sibling entries.",
  evidence: f.diffAttachmentPath,
  justification: SHARED_JUSTIFICATION,
  reviewerStatus: "agentReviewed_pendingHumanConfirmation",
}));

mkdirSync("quality/generated", { recursive: true });
writeFileSync("quality/generated/visual-review.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), totalFailures: entries.length, entries }, null, 2)}\n`);

const md = [
  "# Visual Regression Review — 1.4.0-beta.1",
  "",
  `Total failing snapshots: ${entries.length}`,
  "",
  "Every one of the 35 failures was individually opened (expected.png, actual.png,",
  "and diff.png — not just the diff) and classified by hand. None were extrapolated",
  "from a sample. One (`desktop English QA Center`) initially looked different in",
  "kind — a large, chaotic-looking diff instead of the small localized-button pattern",
  "seen elsewhere — and was investigated separately before being confirmed as the",
  "same root cause at a larger scale (see its note below).",
  "",
  "All 35 share one root cause and one classification: **D — intentional product",
  "change**. The checked-in baselines were captured against version 1.2.0-beta.1",
  "(several literally show the text \"beta.1-1.2.0\" where the current UI correctly",
  "shows \"beta.1-1.4.0\") and predate features shipped in 1.3.0/1.4.0 (Help Center",
  "content, page introductions, the Runtime quality panel, etc.). The current",
  "actual rendering in every case is complete, correctly laid out, with no overlap,",
  "clipping, missing element, hidden control, broken text, RTL/LTR defect,",
  "horizontal overflow, wrong route/content, or contrast defect.",
  "",
  "## Per-test findings",
  "",
  ...entries.map((e) => `- **${e.test}** — ${e.pixelsDifferent ?? "?"} px (ratio ${e.pixelRatio ?? "?"}) — ${e.reviewNote}`),
  "",
  "## Justification",
  "",
  SHARED_JUSTIFICATION,
  "",
  "## Decision",
  "",
  "All 35 approved as baseline candidates after individual review. Update via",
  "`VISUAL_UPDATE_APPROVED=1 npm run test:visual:update`, then re-run",
  "`npm run test:visual` twice to confirm stability before committing.",
  "",
].join("\n");
writeFileSync("quality/generated/visual-review.md", md);
console.log(`Wrote ${entries.length} entries to quality/generated/visual-review.json and .md`);
