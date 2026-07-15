import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidBranchContext,
  redact,
  resolveGitContext,
  secretFindings,
  validateAgainstSchema,
} from "./agent-memory-lib.mjs";
import { validateAgentMemory } from "./validate-agent-memory.mjs";

test("redacts secret-like values and private Windows user paths", () => {
  const output = redact(
    "token=secret-value C:\\Users\\Example\\repo sk-example123456789",
  );
  assert.doesNotMatch(output, /secret-value|Example|sk-example/);
});

test("detects sensitive patterns", () => {
  assert.ok(secretFindings("password=supersecret").length > 0);
  assert.equal(secretFindings("releaseState=blocked").length, 0);
});

test("validates required fields and numeric bounds", () => {
  const schema = {
    type: "object",
    required: ["percent"],
    properties: { percent: { type: "integer", minimum: 0, maximum: 100 } },
  };
  assert.deepEqual(validateAgainstSchema({ percent: 50 }, schema), []);
  assert.ok(validateAgainstSchema({ percent: 101 }, schema).length > 0);
});

const fakeGit =
  (branch = "feature/aos", head = "abc123") =>
  (...args) =>
    args[0] === "branch" ? branch : head;

test("resolves local feature and main branch contexts", () => {
  assert.deepEqual(resolveGitContext({ env: {}, git: fakeGit() }), {
    sourceBranch: "feature/aos",
    currentBranch: "feature/aos",
    targetBranch: "main",
    testedCommit: "abc123",
  });
  assert.equal(
    resolveGitContext({
      env: {},
      git: fakeGit("main"),
      previous: { sourceBranch: "feature/aos" },
    }).sourceBranch,
    "feature/aos",
  );
});

test("resolves GitHub push and pull request contexts", () => {
  const push = resolveGitContext({
    env: {
      GITHUB_ACTIONS: "true",
      GITHUB_REF_NAME: "main",
      GITHUB_SHA: "pushsha",
    },
    git: fakeGit("main"),
    previous: { sourceBranch: "feature/aos" },
  });
  assert.deepEqual(push, {
    sourceBranch: "feature/aos",
    currentBranch: "main",
    targetBranch: "main",
    testedCommit: "pushsha",
  });
  const pr = resolveGitContext({
    env: {
      GITHUB_ACTIONS: "true",
      GITHUB_REF_NAME: "123/merge",
      GITHUB_HEAD_REF: "feature/aos",
      GITHUB_BASE_REF: "main",
      GITHUB_SHA: "mergesha",
    },
    git: fakeGit(""),
  });
  assert.deepEqual(pr, {
    sourceBranch: "feature/aos",
    currentBranch: "123/merge",
    targetBranch: "main",
    testedCommit: "mergesha",
  });
});

test("represents detached and missing Git metadata honestly", () => {
  assert.equal(
    resolveGitContext({ env: {}, git: fakeGit("") }).currentBranch,
    "detached",
  );
  assert.equal(
    resolveGitContext({ env: {}, git: () => "" }).testedCommit,
    "unknown",
  );
});

test("rejects malformed branch context without requiring source and current to match", () => {
  assert.equal(isValidBranchContext("feature/aos"), true);
  assert.equal(isValidBranchContext("main"), true);
  for (const value of [
    "bad branch",
    "bad..branch",
    "topic@{1",
    "topic.lock",
    "bad\\branch",
  ])
    assert.equal(isValidBranchContext(value), false);
});

test("the checked-in Agent Memory state is consistent", () => {
  const result = validateAgentMemory();
  assert.deepEqual(result.errors, []);
});

test("stale quality testedCommit is reported without invalidating historical state", () => {
  const result = validateAgentMemory();
  assert.ok(
    result.warnings.some((warning) =>
      warning.includes("testedCommit is stale"),
    ),
  );
  assert.equal(result.ok, true);
});
