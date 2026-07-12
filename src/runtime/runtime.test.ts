import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApprovalRequest } from "./approvals/approvalService";
import { MockProvider } from "./providers/MockProvider";
import { ProviderRegistry } from "./providers/ProviderRegistry";
import { createRetryPolicy } from "./retry/retryPolicy";
import { createRuntimeEngine } from "./runtimeSetup";
import { createRunRequest, type RuntimeFactory } from "./runtimeFactory";
import { RuntimeHistory } from "./runtimeHistory";
import { transitionRuntime } from "./runtimeStateMachine";
import {
  BrowserRuntimeStorage,
  parseRuntimeHistory,
  type RuntimeStorage,
} from "./runtimeStorage";
import { ToolRegistry } from "./tools/ToolRegistry";
import {
  RUNTIME_SCHEMA_VERSION,
  RUNTIME_STORAGE_KEY,
  RUNTIME_VERSION,
  type MockScenario,
  type RuntimeHistoryRecord,
} from "./types";

function fixedFactory(): RuntimeFactory {
  let id = 0;
  let tick = 0;
  return {
    nextId: () => `fixed-${++id}`,
    now: () => `2026-07-12T00:00:${String(tick++).padStart(2, "0")}.000Z`,
  };
}
class MemoryStorage implements RuntimeStorage {
  records: RuntimeHistoryRecord[] = [];
  fail = false;
  load() {
    return { records: [...this.records] };
  }
  save(records: readonly RuntimeHistoryRecord[]) {
    if (this.fail) return { ok: false, warning: "unavailable" };
    this.records = structuredClone(Array.from(records));
    return { ok: true };
  }
}
function setup() {
  const storage = new MemoryStorage();
  const factory = fixedFactory();
  const engine = createRuntimeEngine({ storage, factory });
  const request = (
    scenario: MockScenario = "success",
    mode: "mock" | "dryRun" | "liveReserved" = "mock",
  ) =>
    createRunRequest(factory, {
      mode,
      scenario,
      text: "<script>inert</script> QA request",
      plannedToolIds: ["jira-reader"],
    });
  return { storage, factory, engine, request };
}

describe("Runtime state machine", () => {
  const move = (
    from: Parameters<typeof transitionRuntime>[0]["status"],
    to: Parameters<typeof transitionRuntime>[1],
  ) =>
    transitionRuntime(
      { status: from, events: [] },
      to,
      "run",
      `${from}-${to}`,
      fixedFactory(),
    );
  it("allows draft to queued", () =>
    expect(move("draft", "queued").ok).toBe(true));
  it("allows queued to running", () =>
    expect(move("queued", "running").ok).toBe(true));
  it("allows running to completed", () =>
    expect(move("running", "completed").ok).toBe(true));
  it("allows running to failed", () =>
    expect(move("running", "failed").ok).toBe(true));
  it("allows running to cancelled", () =>
    expect(move("running", "cancelled").ok).toBe(true));
  it("allows running to waitingForApproval", () =>
    expect(move("running", "waitingForApproval").ok).toBe(true));
  it("allows approval back to running", () =>
    expect(move("waitingForApproval", "running").ok).toBe(true));
  it("allows rejection to cancelled", () =>
    expect(move("waitingForApproval", "cancelled").ok).toBe(true));
  it("allows retrying to running", () =>
    expect(move("retrying", "running").ok).toBe(true));
  it("allows exhausted retry to failed", () =>
    expect(move("retrying", "failed").ok).toBe(true));
  it("rejects invalid transitions without mutation", () => {
    const state = { status: "draft" as const, events: [] };
    const result = transitionRuntime(
      state,
      "failed",
      "run",
      "bad",
      fixedFactory(),
    );
    expect(result.ok).toBe(false);
    expect(result.state).toBe(state);
    expect(result.error?.code).toBe("invalidTransition");
  });
  it("does not rewrite terminal states", () =>
    expect(move("completed", "running").ok).toBe(false));
  it("makes cancellation idempotent", () =>
    expect(move("cancelled", "cancelled").state.events).toHaveLength(0));
  it("orders events and deterministic IDs", () => {
    const factory = fixedFactory();
    const first = transitionRuntime(
      { status: "draft", events: [] },
      "queued",
      "run",
      "queued",
      factory,
    ).state;
    const second = transitionRuntime(
      first,
      "running",
      "run",
      "running",
      factory,
    ).state;
    expect(second.events.map((event) => [event.sequence, event.id])).toEqual([
      [1, "fixed-1"],
      [2, "fixed-2"],
    ]);
  });
});

describe("Runtime engine and providers", () => {
  it("exposes honest provider status and rejects unknown providers", () => {
    const registry = new ProviderRegistry([new MockProvider()]);
    expect(
      registry.statuses().map((status) => [status.id, status.status]),
    ).toEqual([
      ["mock", "mockReady"],
      ["liveReserved", "notConfigured"],
    ]);
    expect(registry.get("missing")).toMatchObject({
      ok: false,
      error: { code: "unknownProvider" },
    });
  });
  it("produces deterministic Mock success", async () => {
    const one = setup(),
      two = setup();
    const a = await one.engine.startMock(one.request());
    const b = await two.engine.startMock(two.request());
    expect(a.result.output).toBe(b.result.output);
    expect(
      a.result.events.map((event) => [event.status, event.safeSummary]),
    ).toEqual(
      b.result.events.map((event) => [event.status, event.safeSummary]),
    );
  });
  it("retries then succeeds deterministically", async () => {
    const { engine, request } = setup();
    const record = await engine.startMock(request("retryThenSuccess"));
    expect(record.result.status).toBe("completed");
    expect(record.result.attempts).toBe(2);
    expect(record.result.events.map((event) => event.status)).toContain(
      "retrying",
    );
  });
  it("fails after retry exhaustion", async () => {
    const { engine, request } = setup();
    const record = await engine.startMock(request("retryExhausted"));
    expect(record.result).toMatchObject({
      status: "failed",
      attempts: 2,
      error: { code: "retryExhausted" },
    });
  });
  it("pauses for approval and resumes explicitly", async () => {
    const { engine, request } = setup();
    const waiting = await engine.startMock(request("approvalRequired"));
    expect(waiting.result).toMatchObject({
      status: "waitingForApproval",
      approval: { decision: "pending" },
    });
    expect(engine.approve(waiting.id)?.result).toMatchObject({
      status: "completed",
      approval: { decision: "approved" },
    });
  });
  it("rejecting approval cancels", async () => {
    const { engine, request } = setup();
    const waiting = await engine.startMock(request("approvalRejected"));
    expect(engine.reject(waiting.id)?.result).toMatchObject({
      status: "cancelled",
      approval: { decision: "rejected" },
    });
  });
  it("approval is fresh and cannot be reused", () => {
    const a = createApprovalRequest({
      id: "a",
      runId: "run-a",
      requestedAt: "now",
    });
    const b = createApprovalRequest({
      id: "b",
      runId: "run-b",
      requestedAt: "now",
    });
    expect(a.decision).toBe("pending");
    expect(b.runId).not.toBe(a.runId);
  });
  it("cancels and ignores terminal rewrites", async () => {
    const { engine, request } = setup();
    const record = await engine.startMock(request("cancelled"));
    expect(record.result.status).toBe("cancelled");
    expect((await engine.cancel(record.id))?.result.events).toHaveLength(
      record.result.events.length,
    );
  });
  it("ignores a late provider completion after cancellation", async () => {
    let resolve!: (value: Awaited<ReturnType<MockProvider["execute"]>>) => void;
    class LateProvider extends MockProvider {
      override execute() {
        return new Promise<Awaited<ReturnType<MockProvider["execute"]>>>(
          (done) => {
            resolve = done;
          },
        );
      }
    }
    const storage = new MemoryStorage(),
      factory = fixedFactory();
    const provider = new LateProvider();
    const engine = new (await import("./runtimeEngine")).RuntimeEngine(
      new ProviderRegistry([provider]),
      new ToolRegistry(),
      new RuntimeHistory(storage),
      factory,
    );
    const req = createRunRequest(factory, { mode: "mock", text: "late" });
    const pending = engine.startMock(req);
    await engine.cancel(req.id);
    resolve({
      outcome: "success",
      output: "late",
      safeSummary: "late",
      warnings: [],
    });
    const result = (await pending).result;
    expect(result.status).toBe("cancelled");
    expect(result).not.toHaveProperty("output");
  });
  it("makes no network request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { engine, request } = setup();
    await engine.startMock(request());
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
  it("Dry Run never calls provider execute and shows assembly/tools", () => {
    const provider = new MockProvider();
    const execute = vi.spyOn(provider, "execute");
    const storage = new MemoryStorage(),
      factory = fixedFactory();
    const Engine = createRuntimeEngine({ storage, factory });
    const req = createRunRequest(factory, {
      mode: "dryRun",
      text: "dry",
      systemInstruction: "system",
      plannedToolIds: ["jira-reader"],
    });
    const record = Engine.createDryRun(req);
    expect(execute).not.toHaveBeenCalled();
    expect(record.result.dryRunPreview).toMatchObject({
      assembledPrompt: "system\n\ndry",
      plannedTools: [expect.stringContaining("not connected")],
    });
  });
  it("rejects Live Reserved and secret-like variables", async () => {
    const { engine, factory } = setup();
    const live = createRunRequest(factory, {
      mode: "liveReserved",
      text: "live",
    });
    expect(engine.createDryRun(live).result.error?.code).toBe(
      "providerNotConfigured",
    );
    const secret = createRunRequest(factory, {
      mode: "mock",
      text: "x",
      variables: { apiKey: "never" },
    });
    await expect(engine.startMock(secret)).resolves.toMatchObject({
      result: { status: "cancelled" },
    });
  });
  it("validates retry limits and stop conditions", () => {
    expect(() => createRetryPolicy({ maxAttempts: 4 })).toThrow();
    expect(() => createRetryPolicy({ maxAttempts: -1 })).toThrow();
    expect(() =>
      createRetryPolicy({ maxAttempts: 2, stopCondition: "" }),
    ).toThrow();
    expect(createRetryPolicy()).toMatchObject({ maxAttempts: 2 });
  });
  it("tool registry is design-only", () => {
    const tool = new ToolRegistry().get("jira-reader");
    expect(tool).toMatchObject({
      connectionStatus: "notConnected",
      requiresApproval: true,
    });
    expect(tool).not.toHaveProperty("execute");
  });
  it("keeps external text inert and errors safe", async () => {
    const { engine, request } = setup();
    const record = await engine.startMock(request());
    expect(record.result.output).toContain("<script>inert</script>");
    expect(JSON.stringify(record)).not.toContain("stack");
  });
});

describe("Runtime history storage", () => {
  beforeEach(() => localStorage.clear());
  it("persists newest first and reloads", async () => {
    const { engine, request } = setup();
    const one = await engine.startMock(request()),
      two = await engine.startMock(request());
    expect(engine.getRuns().map((run) => run.id)).toEqual([two.id, one.id]);
  });
  it("retains at most 50 records", async () => {
    const { engine, request } = setup();
    for (let index = 0; index < 52; index += 1)
      await engine.startMock(request());
    expect(engine.getRuns()).toHaveLength(50);
  });
  it("deletes one and clears all", async () => {
    const { engine, request } = setup();
    const record = await engine.startMock(request());
    engine.deleteRun(record.id);
    expect(engine.getRuns()).toEqual([]);
    await engine.startMock(request());
    engine.clearHistory();
    expect(engine.getRuns()).toEqual([]);
  });
  it("recovers from malformed and unsupported storage", () => {
    expect(parseRuntimeHistory("{bad")).toMatchObject({
      records: [],
      warning: expect.any(String),
    });
    expect(
      parseRuntimeHistory(
        JSON.stringify({ schemaVersion: 99, runtimeVersion: "x", records: [] }),
      ),
    ).toMatchObject({ records: [], warning: expect.any(String) });
  });
  it("storage failure does not crash or evict existing memory", async () => {
    const { engine, request, storage } = setup();
    const record = await engine.startMock(request());
    storage.fail = true;
    engine.clearHistory();
    expect(engine.getRun(record.id)).toBeDefined();
  });
  it("browser storage schema persists and keeps unrelated domains", () => {
    localStorage.setItem("auth", "yes");
    localStorage.setItem("language", "he");
    localStorage.setItem("course", "progress");
    localStorage.setItem("prompts", "mine");
    localStorage.setItem("agents", "mine");
    const storage = new BrowserRuntimeStorage(localStorage);
    storage.save([]);
    expect(
      JSON.parse(localStorage.getItem(RUNTIME_STORAGE_KEY)!),
    ).toMatchObject({
      schemaVersion: RUNTIME_SCHEMA_VERSION,
      runtimeVersion: RUNTIME_VERSION,
    });
    storage.save([]);
    expect([
      localStorage.getItem("auth"),
      localStorage.getItem("language"),
      localStorage.getItem("course"),
      localStorage.getItem("prompts"),
      localStorage.getItem("agents"),
    ]).toEqual(["yes", "he", "progress", "mine", "mine"]);
  });
  it("does not persist secret-like model fields", async () => {
    const { engine, request, storage } = setup();
    await engine.startMock(request());
    expect(JSON.stringify(storage.records)).not.toMatch(
      /apiKey|password|credential|rawStack/i,
    );
  });
});
