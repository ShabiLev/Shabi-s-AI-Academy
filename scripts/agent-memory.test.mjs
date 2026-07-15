import assert from "node:assert/strict";
import test from "node:test";
import { redact, secretFindings, validateAgainstSchema } from "./agent-memory-lib.mjs";
import { validateAgentMemory } from "./validate-agent-memory.mjs";

test("redacts secret-like values and private Windows user paths", () => {
  const output = redact("token=secret-value C:\\Users\\Example\\repo sk-example123456789");
  assert.doesNotMatch(output, /secret-value|Example|sk-example/);
});

test("detects sensitive patterns", () => {
  assert.ok(secretFindings("password=supersecret").length > 0);
  assert.equal(secretFindings("releaseState=blocked").length, 0);
});

test("validates required fields and numeric bounds", () => {
  const schema = { type: "object", required: ["percent"], properties: { percent: { type: "integer", minimum: 0, maximum: 100 } } };
  assert.deepEqual(validateAgainstSchema({ percent: 50 }, schema), []);
  assert.ok(validateAgainstSchema({ percent: 101 }, schema).length > 0);
});

test("the checked-in Agent Memory state is consistent", () => {
  const result = validateAgentMemory();
  assert.deepEqual(result.errors, []);
});
