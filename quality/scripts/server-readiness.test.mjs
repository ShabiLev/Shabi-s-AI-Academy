import assert from "node:assert/strict";
import test from "node:test";
import { terminateProcessTree, terminateProcessTreeAndWait } from "./server-readiness.mjs";

test("terminateProcessTree kills the full Windows process tree", () => {
  const calls = [];
  const child = { pid: 4175, kill: () => assert.fail("kill should not run") };

  terminateProcessTree(child, {
    platform: "win32",
    execute: (...args) => calls.push(args),
  });

  assert.deepEqual(calls, [
    ["taskkill", ["/pid", "4175", "/T", "/F"], { stdio: "ignore" }],
  ]);
});

test("terminateProcessTree sends SIGTERM on POSIX", () => {
  const signals = [];
  terminateProcessTree(
    { pid: 4175, kill: (signal) => signals.push(signal) },
    { platform: "linux" },
  );
  assert.deepEqual(signals, ["SIGTERM"]);
});

test("terminateProcessTree tolerates missing and already-stopped processes", () => {
  assert.doesNotThrow(() => terminateProcessTree(undefined));
  assert.doesNotThrow(() =>
    terminateProcessTree(
      { pid: 4175 },
      {
        platform: "win32",
        execute: () => {
          throw new Error("not found");
        },
      },
    ),
  );
});

test("terminateProcessTreeAndWait waits for the child exit event", async () => {
  let exitHandler;
  const signals = [];
  const child = { pid: 4175, exitCode: null, kill: (signal) => { signals.push(signal); queueMicrotask(() => exitHandler?.()); }, once: (event, handler) => { assert.equal(event, "exit"); exitHandler = handler; } };
  await terminateProcessTreeAndWait(child, { platform: "linux", timeoutMs: 100 });
  assert.deepEqual(signals, ["SIGTERM"]);
});
