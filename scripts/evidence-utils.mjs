import path from "node:path";

const AUTHORIZATION = /(authorization\s*[=:]\s*(?:Bearer\s+)?)[^\r\n]+/gi;
const SECRET_ASSIGNMENT = /(password|passwd|access[_-]?token|refresh[_-]?token|id[_-]?token|api[_-]?key|service[_-]?role(?:[_-]?key)?|client[_-]?secret|magic[_-]?link|reset[_-]?token)(\s*[=:]\s*)([^\s,;]+)/gi;
const SECRET_QUERY = /([?&](?:access_token|refresh_token|token|code|password|api_key)=)[^&#\s]+/gi;
const JWT = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;
const BEARER = /(Bearer\s+)[A-Za-z0-9._~+\/-]+=*/gi;
const SUPABASE_KEY = /\bsb_(?:secret|publishable)_[A-Za-z0-9_-]+\b/gi;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

function escaped(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function redactText(value, options = {}) {
  let text = String(value ?? "");
  const workspace = options.workspace ? path.resolve(options.workspace) : null;
  const sensitiveValues = (options.sensitiveValues ?? []).filter(
    (item) => typeof item === "string" && item.length >= 6,
  );

  if (workspace) {
    const variants = new Set([
      workspace,
      workspace.replaceAll("\\", "/"),
      workspace.replaceAll("/", "\\"),
    ]);
    for (const variant of variants) {
      text = text.replace(new RegExp(escaped(variant), "gi"), "[WORKSPACE]");
    }
  }

  for (const secret of sensitiveValues) {
    text = text.replace(new RegExp(escaped(secret), "g"), "[REDACTED]");
  }

  return text
    .replace(AUTHORIZATION, "$1[REDACTED]")
    .replace(SECRET_ASSIGNMENT, "$1$2[REDACTED]")
    .replace(SECRET_QUERY, "$1[REDACTED]")
    .replace(BEARER, "$1[REDACTED]")
    .replace(JWT, "[REDACTED]")
    .replace(SUPABASE_KEY, "[REDACTED]")
    .replace(EMAIL, "[REDACTED_EMAIL]")
    .replace(/\b[A-Za-z]:\\Users\\[^\\\s]+/gi, "[REDACTED_HOME]")
    .replace(/\/(?:home|Users)\/[^/\s]+/g, "[REDACTED_HOME]");
}

export function safeSlug(value, fallback = "run") {
  const slug = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || fallback;
}

export function boundedRunIndex(entries, nextEntry, maximum = 20) {
  const withoutDuplicate = entries.filter((entry) => entry.runId !== nextEntry.runId);
  return [nextEntry, ...withoutDuplicate]
    .sort((left, right) => String(right.date).localeCompare(String(left.date)))
    .slice(0, maximum);
}

export function summarizeCoverage(raw, thresholds, previous = null) {
  const total = raw?.total ?? raw;
  const metrics = {};
  for (const name of ["statements", "branches", "functions", "lines"]) {
    const percent = Number(total?.[name]?.pct ?? total?.[name]);
    const threshold = Number(thresholds[name]);
    const prior = Number(previous?.[name]?.percent ?? previous?.[name]);
    metrics[name] = {
      percent: Number.isFinite(percent) ? percent : null,
      threshold,
      passed: Number.isFinite(percent) ? percent >= threshold : false,
      delta: Number.isFinite(percent) && Number.isFinite(prior)
        ? Number((percent - prior).toFixed(2))
        : null,
    };
  }
  return {
    status: Object.values(metrics).every((metric) => metric.passed)
      ? "passed"
      : "failed",
    ...metrics,
  };
}

export function deriveRecommendation({ profile, commands, coverage, manualReviews, workingTreeCleanAtTest = true }) {
  const blockerFailed = commands.some(
    (command) => command.criticality === "blocker"
      && ["failed", "notAvailable"].includes(command.status),
  );
  const manualFailed = Object.values(manualReviews).some(
    (review) => review.status === "failed",
  );
  if (!workingTreeCleanAtTest || blockerFailed || manualFailed || coverage?.status === "failed") return "Blocked";
  if (profile !== "full") return "Not fully evaluated";
  const allManualPassed = Object.values(manualReviews).every(
    (review) => review.status === "passed",
  );
  return allManualPassed ? "Ready" : "Ready with warnings";
}

export const evidenceMetadataPrefixes = [
  ".agent/state/",
  ".agent/memory/",
  ".agent/handoff/",
  "quality/execution/latest/",
];

export function isEvidenceMetadataPath(file) {
  const normalized = String(file ?? "").replaceAll("\\", "/");
  return (
    evidenceMetadataPrefixes.some((prefix) => normalized.startsWith(prefix)) ||
    normalized === "quality/execution/index.json"
  );
}

export function isWorkingTreeClean(statusOutput) {
  return String(statusOutput ?? "").trim().length === 0;
}

export function assessEvidenceIntegrity({
  testedCommit,
  evidenceCommit,
  parentCommit,
  headCommit,
  workingTreeCleanAtTest,
  testedIsAncestor = false,
  evidenceIsAncestor = false,
  changedPaths = [],
}) {
  const errors = [];
  if (!testedCommit || testedCommit === "unknown") errors.push("testedCommit is missing");
  if (!evidenceCommit || ["unrecorded", "pending"].includes(evidenceCommit))
    errors.push("evidenceCommit is not finalized");
  if (!parentCommit) errors.push("parentCommit is missing");
  if (!headCommit) errors.push("HEAD commit is missing");
  if (workingTreeCleanAtTest !== true)
    errors.push("evidence was generated from a dirty working tree");
  if (!testedIsAncestor) errors.push("testedCommit is not an ancestor of HEAD");
  if (!evidenceIsAncestor) errors.push("evidenceCommit is not an ancestor of HEAD");
  const disallowed = changedPaths.filter((file) => !isEvidenceMetadataPath(file));
  if (disallowed.length)
    errors.push(`post-test changes include non-evidence files: ${disallowed.join(", ")}`);
  return { ok: errors.length === 0, errors, disallowed };
}
