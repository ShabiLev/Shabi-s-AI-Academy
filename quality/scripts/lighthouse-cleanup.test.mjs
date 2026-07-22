import assert from "node:assert/strict";
import test from "node:test";
import { extractCompletedLighthouseReport, isWindowsLighthouseCleanupOnlyFailure, lighthouseTempPaths, removeWithBoundedRetry } from "./lighthouse-cleanup.mjs";

test("classifies only the known Windows Chrome Launcher cleanup failure", () => {
  const cleanup = "Error: EPERM, Permission denied: C:\\Temp\\lighthouse.123 at Launcher.destroyTmp (chrome-launcher/dist/chrome-launcher.js:367:9)";
  assert.equal(isWindowsLighthouseCleanupOnlyFailure(cleanup, "win32"), true);
  assert.equal(isWindowsLighthouseCleanupOnlyFailure(cleanup, "linux"), false);
  assert.equal(isWindowsLighthouseCleanupOnlyFailure(`${cleanup}\nAssertion failed`, "win32"), false);
});

test("extracts unique Lighthouse temporary paths", () => {
  assert.deepEqual(lighthouseTempPaths("lighthouse.123 lighthouse.123 lighthouse.456", "C:\\Temp"), ["C:\\Temp\\lighthouse.123", "C:\\Temp\\lighthouse.456"]);
});

test("uses bounded retry options for cleanup", async () => {
  const calls = [];
  await removeWithBoundedRetry("C:\\Temp\\lighthouse.123", async (...args) => { calls.push(args); });
  assert.deepEqual(calls, [["C:\\Temp\\lighthouse.123", { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }]]);
});

test("extracts only a completed Lighthouse report from mixed process output", () => {
  const completed = { lighthouseVersion: "12.6.1", finalUrl: "http://127.0.0.1/login", audits: {}, categories: {} };
  const output = `runner {"status":"failed"}\n${JSON.stringify(completed)}\nError: EPERM`;
  assert.deepEqual(extractCompletedLighthouseReport(output), completed);
  assert.equal(extractCompletedLighthouseReport('runner {"status":"failed"}'), null);
});
