import type { Page } from "@playwright/test";
import { expect, test } from "../fixtures/academy";
import {
  addLearningEvidence,
  builtInFailureCases,
  deriveSkillLevel,
  exportCodexAgent,
  parseCodexToml,
  type LearningEvidence,
} from "../../src/evaluations";

async function startEnglish(page: Page): Promise<void> {
  await page.addInitScript(() => localStorage.setItem("shabis-ai-academy-language", "en"));
}

async function createExperiment(
  page: Page,
  name: string,
  options: { english?: boolean; extraCompetitor?: boolean } = {},
): Promise<string> {
  if (options.english) await startEnglish(page);
  await page.goto("/evaluations/new");
  await expect(page.getByTestId("evaluation-builder")).toBeVisible();
  const nameInput = page.locator('input[maxlength="120"]');
  await nameInput.fill(name);
  if (options.extraCompetitor) {
    await page.getByRole("checkbox", { name: /Guided Team|צוות מודרך/ }).check();
  }
  await page.getByRole("button", { name: /Create experiment draft|יצירת טיוטת ניסוי/ }).click();
  await expect(page).toHaveURL(/\/evaluations\/evaluation-/);
  return page.url().split("/").at(-1) ?? "";
}

async function completeExperiment(page: Page, name: string, english = true): Promise<string> {
  const evaluationId = await createExperiment(page, name, { english });
  await page.getByRole("button", { name: /Start run|התחלת הרצה/ }).click();
  await page.getByRole("button", { name: /Complete deterministic evaluation|השלמת הערכה דטרמיניסטית/ }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  return evaluationId;
}

async function runAccessibilitySuite(page: Page): Promise<void> {
  await startEnglish(page);
  await page.goto("/evaluation-suites/react-accessibility");
  await page.getByRole("button", { name: "Create accessibility suite" }).click();
  await page.getByRole("button", { name: "Run all suite cases" }).click();
  await expect(page.getByRole("status")).toContainText("Every suite case ran");
}

async function readEvaluationDomain(page: Page, domain: string): Promise<Record<string, unknown> | null> {
  return page.evaluate((prefix) => {
    const key = Object.keys(localStorage).find((candidate) => candidate.startsWith(prefix));
    return key ? JSON.parse(localStorage.getItem(key) ?? "null") : null;
  }, `shabis-ai-academy:${domain}:v1:`);
}

test("@v1.9 cross-browser Hebrew Agent comparison freezes two exact competitors", async ({ page }) => {
  const evaluationId = await createExperiment(page, "השוואת סוכני React נגישה");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByText(/Academy deterministic evaluation|הערכת Academy דטרמיניסטית/)).toBeVisible();
  const stored = await readEvaluationDomain(page, "evaluation-experiments");
  expect(stored?.items).toEqual(expect.arrayContaining([
    expect.objectContaining({
      id: evaluationId,
      competitorIds: ["accessible-react-v1.3", "baseline-react-v1.2"],
      status: "draft",
    }),
  ]));
});

test("@v1.9 cross-browser English Prompt A/B preserves seed, repetitions, and evaluator versions", async ({ page }) => {
  await createExperiment(page, "Prompt A B controlled comparison", { english: true, extraCompetitor: true });
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { name: "Prompt A B controlled comparison" })).toBeVisible();
  const stored = await readEvaluationDomain(page, "evaluation-experiments");
  expect(stored?.items).toEqual(expect.arrayContaining([
    expect.objectContaining({
      seed: "academy-19-beta",
      repetitionCount: 2,
      competitorIds: expect.arrayContaining(["accessible-react-v1.3", "baseline-react-v1.2", "guided-team-v2.0"]),
      evaluatorIds: expect.arrayContaining(["requirements-evaluator", "accessibility-evaluator", "reality-checker"]),
    }),
  ]));
});

test("@v1.9 Rubric creation validates exactly 100 and clone preserves built-in source", async ({ page }) => {
  await startEnglish(page);
  await page.goto("/evaluations/new");
  const rubric = page.locator(".evaluation-rubric");
  await expect(rubric).toContainText("Weights total exactly 100.");
  await rubric.getByRole("button", { name: "Clone to edit" }).click();
  await expect(rubric).toContainText("User copy · source preserved");
  const weights = await rubric.locator('input[type="number"]').allTextContents();
  expect(weights).toHaveLength(4);
  await rubric.locator('input[type="number"]').first().fill("31");
  await expect(rubric).toContainText("A total of 100 is required; current total is 101.");
});

test("@v1.9 Evaluator disagreement remains visible and cannot silently certify", async ({ page }) => {
  const evaluationId = await completeExperiment(page, "Evaluator disagreement evidence");
  await page.goto(`/evaluations/${evaluationId}/results`);
  await expect(page.getByTestId("evaluation-results")).toBeVisible();
  const rows = page.locator(".evaluation-comparison tbody tr");
  await expect(rows).toHaveCount(8);
  const statuses = await rows.locator("td:nth-child(3)").allTextContents();
  expect(new Set(statuses).size).toBeGreaterThan(1);
  await expect(page.getByText(/Uncertified|Rubric certified/)).toBeVisible();
  await expect(rows.first().locator("td:nth-child(5)")).not.toBeEmpty();
  await expect(rows.first().locator("td:nth-child(6)")).toContainText(/high/);
});

test("@v1.9 cross-browser Pause reload continue resumes the exact immutable checkpoint", async ({ page }) => {
  const evaluationId = await createExperiment(page, "Pause and exact resume", { english: true });
  await page.getByRole("button", { name: "Start run" }).click();
  await expect(page.getByText("Running", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Safe pause" }).click();
  await expect(page.getByText("Paused", { exact: true })).toBeVisible();
  const paused = await readEvaluationDomain(page, "evaluation-runs");
  const pausedRun = (paused?.items as Array<Record<string, unknown>>)[0];
  expect(pausedRun).toMatchObject({
    experimentId: evaluationId,
    status: "paused",
    progress: { competitorIndex: 0, repetitionIndex: 0, evaluatorIndex: 0 },
  });
  await page.reload();
  await expect(page.getByRole("button", { name: "Continue exact progress" })).toBeVisible();
  await page.getByRole("button", { name: "Continue exact progress" }).click();
  await expect(page.getByText("Running", { exact: true })).toBeVisible();
  const resumed = await readEvaluationDomain(page, "evaluation-runs");
  const resumedRun = (resumed?.items as Array<Record<string, unknown>>)[0];
  expect(resumedRun).toMatchObject({
    id: pausedRun.id,
    inputHash: pausedRun.inputHash,
    frozenRefs: pausedRun.frozenRefs,
    progress: pausedRun.progress,
    status: "running",
  });
});

test("@v1.9 Blocking regression suite keeps the baseline immutable and exposes per-case evidence", async ({ page }) => {
  await runAccessibilitySuite(page);
  await expect(page.getByText("Publication blocked", { exact: true })).toBeVisible();
  const table = page.getByRole("table");
  await expect(page.getByRole("heading", { name: /Comparison with baseline version 1\.2/ })).toBeVisible();
  await expect(table).toContainText("regression");
  await expect(page.getByRole("alert")).toContainText("Critical regression or missing evidence");
  await expect(page.getByText(/baseline was not changed/)).toBeVisible();
  await expect(table.locator("tbody tr")).toHaveCount(4);
});

test("@v1.9 Failure Case creates reusable practice evidence without granting mastery", async ({ page }) => {
  const evaluationId = await completeExperiment(page, "Failure learning evidence");
  await page.goto(`/evaluations/${evaluationId}/results`);
  await page.getByRole("button", { name: "Create failure case" }).click();
  await expect(page.getByRole("status")).toContainText(/failure case/i);
  const stored = await readEvaluationDomain(page, "failure-library");
  expect(stored?.items).toEqual(expect.arrayContaining([
    expect.objectContaining({ category: "requirement gap" }),
  ]));
  const skillStore = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((candidate) => candidate.startsWith("shabis-ai-academy:skill-map:v1:"));
    return key ? JSON.parse(localStorage.getItem(key) ?? "null") : null;
  });
  expect(skillStore?.progress).toEqual(expect.arrayContaining([
    expect.objectContaining({
      skillId: "qa",
      level: "practised",
      evidence: expect.arrayContaining([expect.objectContaining({ source: "evaluation", sourceId: expect.stringMatching(/^evaluation-run-/) })]),
    }),
  ]));

  const practice: LearningEvidence = {
    schemaVersion: 1,
    id: "learning-failure-focus",
    skillId: "accessibility-review",
    runId: "run-focus-regression",
    evaluatorId: "reality-checker",
    outcome: "practice",
    confidence: "high",
    evidenceIds: ["evidence-focus-regression"],
    createdAt: "2026-07-30T12:00:00.000Z",
  };
  expect(deriveSkillLevel(addLearningEvidence([], practice))).toBe("practised");
  expect(builtInFailureCases[0].reusableRule.en).toBe("Never allow self-approval.");
});

test("@v1.9 Connected GitHub preview proves zero network writes and no browser credentials", async ({ page }) => {
  const mutatingRequests: string[] = [];
  page.on("request", (request) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method())) {
      mutatingRequests.push(`${request.method()} ${request.url()}`);
    }
  });
  const evaluationId = await completeExperiment(page, "Connected preview zero writes");
  await page.goto(`/evaluations/${evaluationId}/results`);
  const preview = page.locator(".evaluation-preview");
  await expect(preview).toContainText("Preview only");
  await expect(preview).toContainText("Unavailable");
  await preview.getByRole("button", { name: "Save preview locally" }).click();
  await expect(preview.getByRole("button", { name: "Preview saved locally" })).toBeDisabled();
  const stored = await readEvaluationDomain(page, "connected-previews");
  expect(stored?.items).toEqual(expect.arrayContaining([
    expect.objectContaining({ connectorType: "github", status: "unavailable" }),
  ]));
  await expect(preview.locator('input[type="password"]')).toHaveCount(0);
  expect(mutatingRequests).toEqual([]);
});

test("@v1.9 Codex export validates TOML round trip and downloads without installing an Agent", async ({ page }) => {
  const expected = exportCodexAgent({
    name: "academy_reviewer",
    description: "Evidence-first Academy reviewer",
    developerInstructions: "Review evidence and report missing proof. Never self-approve.",
    permissions: ["read", "unsupported-install"],
    provenance: "Academy local Agent version 1.9",
  });
  expect(parseCodexToml(expected.toml)).toEqual(expected.parsed);
  expect(expected.omittedFields).toEqual(["permissions:unsupported-install"]);
  expect(expected.checksum).toMatch(/^fnv1a32-[a-f0-9]{8}$/);

  const evaluationId = await completeExperiment(page, "Codex export round trip");
  await page.goto(`/evaluations/${evaluationId}/results`);
  await page.getByRole("button", { name: "Generate Codex export" }).click();
  await expect(page.getByText(/Checksum:/)).toContainText(/fnv1a32-[a-f0-9]{8}/);
  await expect(page.getByText(/unsupported-install/)).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download TOML" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.toml$/);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  expect(Buffer.concat(chunks).toString("utf8")).toContain("[agent]");
  await expect(page.getByText(/not installed|does not install/i)).toBeVisible();
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth, JSON.stringify(layout)).toBeLessThanOrEqual(layout.clientWidth + 1);
});

test("@v1.9 mobile English 320x568 preserves focus, LTR, and has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await startEnglish(page);
  await page.goto("/evaluations/new");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  const create = page.getByRole("button", { name: "Create experiment draft" });
  await create.focus();
  await expect(create).toBeFocused();
  const overflow = await page.evaluate(() => {
    const clientWidth = document.documentElement.clientWidth;
    return {
      clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll<HTMLElement>("body *")].map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return { tag: element.tagName, className: element.className, text: element.innerText?.slice(0, 80), left: rect.left, right: rect.right, width: rect.width, clientWidth: element.clientWidth, scrollWidth: element.scrollWidth, minWidth: style.minWidth, transform: style.transform };
      }).filter((item) => item.right > clientWidth + 1 || item.left < -1 || item.scrollWidth > item.clientWidth + 1).slice(0, 20),
    };
  });
  expect(overflow.scrollWidth, JSON.stringify(overflow)).toBe(overflow.clientWidth);
});

test("@v1.9 safe trace exposes evidence and permissions without private reasoning or local paths", async ({ page }) => {
  const evaluationId = await completeExperiment(page, "Sanitized trace evidence");
  await page.goto(`/evaluations/${evaluationId}/trace`);
  await expect(page.getByRole("heading", { name: "Safe run trace" })).toBeVisible();
  await page.getByLabel("Filter by phase").selectOption("evaluate");
  await expect(page.locator(".evaluation-trace-list > li")).toHaveCount(4);
  await expect(page.getByText("4 events shown")).toHaveClass(/sr-only/);
  const text = await page.getByTestId("evaluation-trace").innerText();
  expect(text).toContain("permission: read-only");
  expect(text).not.toMatch(/[A-Z]:\\Users\\|\/(?:home|Users)\//i);
});

test("@v1.9 V1.8 regression keeps Missions, Teams, WALK ME, Help, Radar, and backup usable", async ({ page }) => {
  await page.goto("/missions");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("/team");
  await expect(page.getByTestId("team-page")).toBeVisible();
  await page.goto("/help");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: /WALK ME/ }).last()).toBeVisible();
  await page.goto("/radar");
  await expect(page.locator(".radar-page")).toBeVisible();
  await page.goto("/settings");
  await expect(page.getByText(/Backup|גיבוי/).first()).toBeVisible();
});
