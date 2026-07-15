import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { repoRoot } from "./aos-lib.mjs";

export const stateFiles = [
  "current-task",
  "current-progress",
  "project-status",
  "release-status",
  "known-issues",
  "technical-debt",
  "research-progress",
  "quality-status",
  "latest-handoff",
  "next-actions",
];

export const statePath = (name) =>
  path.join(repoRoot, ".agent", "state", `${name}.json`);
export const schemaPath = (name) =>
  path.join(repoRoot, ".agent", "schemas", `${name}.schema.json`);

export function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

export function readJsonIfPresent(file, fallback = null) {
  try {
    return existsSync(file) ? readJson(file) : fallback;
  } catch {
    return fallback;
  }
}

export function isValidBranchContext(value, { allowSentinel = true } = {}) {
  if (typeof value !== "string" || value.length === 0 || value.length > 255)
    return false;
  if (allowSentinel && ["unknown", "detached"].includes(value)) return true;
  return !/[\s\x00-\x1f\x7f~^:?*\[\\]|\.\.|@\{|\.lock$|^\.|\.$|\/\//.test(
    value,
  );
}

export function resolveGitContext({
  env = process.env,
  git,
  previous = {},
} = {}) {
  const runGit =
    git ??
    ((...args) => {
      try {
        return execFileSync("git", args, {
          cwd: repoRoot,
          encoding: "utf8",
        }).trim();
      } catch {
        return "";
      }
    });
  const localBranch = runGit("branch", "--show-current") || "detached";
  const localHead = runGit("rev-parse", "HEAD") || "unknown";
  const isGitHub = env.GITHUB_ACTIONS === "true";
  const isPullRequest = isGitHub && Boolean(env.GITHUB_HEAD_REF);
  const currentBranch = isGitHub
    ? env.GITHUB_REF_NAME || localBranch
    : localBranch;
  const sourceBranch = isPullRequest
    ? env.GITHUB_HEAD_REF
    : currentBranch === "main"
      ? previous.sourceBranch || "main"
      : currentBranch;
  const targetBranch = isPullRequest
    ? env.GITHUB_BASE_REF || "main"
    : previous.targetBranch || "main";
  return {
    sourceBranch: sourceBranch || "unknown",
    currentBranch: currentBranch || "unknown",
    targetBranch: targetBranch || "main",
    testedCommit: env.GITHUB_SHA || localHead,
  };
}

export function redact(value) {
  const text = String(value ?? "")
    .replace(/(?:sk-|ghp_|github_pat_)[A-Za-z0-9_-]{12,}/g, "[REDACTED]")
    .replace(
      /(authorization|token|password|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi,
      "$1=[REDACTED]",
    )
    .replace(/[A-Za-z]:\\Users\\[^\\\s]+/gi, "<user-home>");
  return text.slice(0, 4000);
}

export function validateAgainstSchema(value, schema, at = "$") {
  const errors = [];
  const typeOk = (expected, candidate) =>
    expected === "array"
      ? Array.isArray(candidate)
      : expected === "object"
        ? candidate !== null &&
          typeof candidate === "object" &&
          !Array.isArray(candidate)
        : expected === "integer"
          ? Number.isInteger(candidate)
          : expected === "null"
            ? candidate === null
            : typeof candidate === expected;
  if (
    schema.type &&
    !(Array.isArray(schema.type)
      ? schema.type.some((type) => typeOk(type, value))
      : typeOk(schema.type, value))
  )
    return [
      `${at}: expected ${Array.isArray(schema.type) ? schema.type.join(" or ") : schema.type}`,
    ];
  if (schema.enum && !schema.enum.includes(value))
    errors.push(`${at}: value is not allowed`);
  if (
    typeof value === "string" &&
    schema.minLength &&
    value.length < schema.minLength
  )
    errors.push(`${at}: string is too short`);
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum)
      errors.push(`${at}: below minimum`);
    if (schema.maximum !== undefined && value > schema.maximum)
      errors.push(`${at}: above maximum`);
  }
  if (Array.isArray(value)) {
    if (schema.maxItems !== undefined && value.length > schema.maxItems)
      errors.push(`${at}: too many items`);
    value.forEach((item, index) =>
      errors.push(
        ...validateAgainstSchema(item, schema.items ?? {}, `${at}[${index}]`),
      ),
    );
  } else if (value !== null && typeof value === "object") {
    for (const key of schema.required ?? [])
      if (!(key in value)) errors.push(`${at}.${key}: required`);
    if (schema.additionalProperties === false)
      for (const key of Object.keys(value))
        if (!(key in (schema.properties ?? {})))
          errors.push(`${at}.${key}: unexpected`);
    for (const [key, child] of Object.entries(schema.properties ?? {}))
      if (key in value)
        errors.push(
          ...validateAgainstSchema(value[key], child, `${at}.${key}`),
        );
  }
  return errors;
}

export function secretFindings(text) {
  const patterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
    /(?:sk-|ghp_|github_pat_)[A-Za-z0-9_-]{12,}/,
    /(?:password|refresh[_-]?token|service[_-]?role[_-]?key)\s*[:=]\s*["']?[^\s,"']{6,}/i,
    /[A-Za-z]:\\Users\\[^\\\s]+/i,
  ];
  return patterns.filter((pattern) => pattern.test(text)).map(String);
}
