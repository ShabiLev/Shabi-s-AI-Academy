import { describe, expect, it, vi } from "vitest";
import { AosEventBus } from "./eventBus";
import { AosScheduler, type ScheduledTaskDefinition } from "./scheduler";
import { CapabilityRegistry } from "./capabilityRegistry";
import { coreCapabilities } from "./catalog";

describe("AOS Event Bus", () => {
  it("delivers typed events, isolates subscriber errors and bounds history", () => {
    let id = 0;
    const bus = new AosEventBus({ historyLimit: 2, createId: () => `event-${++id}`, now: () => "2026-07-22T00:00:00.000Z" });
    const received: string[] = [];
    const unsubscribe = bus.subscribe("radar.item.saved", (event) => received.push(event.payload.itemId));
    bus.subscribe("radar.item.saved", () => { throw new Error("isolated"); });
    bus.publish("radar.item.saved", { version: 1, itemId: "one", saved: true, occurredAt: "2026-07-22T00:00:00.000Z" });
    unsubscribe();
    bus.publish("radar.item.saved", { version: 1, itemId: "two", saved: false, occurredAt: "2026-07-22T00:00:00.000Z" });
    bus.publish("radar.item.saved", { version: 1, itemId: "three", saved: true, occurredAt: "2026-07-22T00:00:00.000Z" });
    expect(received).toEqual(["one"]);
    expect(bus.history().map((event) => event.payload)).toHaveLength(2);
    expect(bus.deliveryErrors()).toHaveLength(2);
  });
});

describe("AOS Scheduler", () => {
  const task: ScheduledTaskDefinition = { id: "radar.refresh", title: "Refresh Radar", schedule: { kind: "manual" }, enabled: true, timeoutMs: 1_000, retry: { maxAttempts: 2, delayMs: 0 }, concurrency: "skip", permission: "network-read" };

  it("runs deterministic manual jobs with bounded retries", async () => {
    const handler = vi.fn().mockRejectedValueOnce(new Error("temporary")).mockResolvedValue(undefined);
    const scheduler = new AosScheduler({ createId: () => "job-1", now: () => "2026-07-22T00:00:00.000Z", sleep: async () => undefined });
    scheduler.register(task, handler);
    const result = await scheduler.trigger(task.id);
    expect(result.status).toBe("succeeded");
    expect(result.attempt).toBe(2);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("rejects disabled tasks and concurrent duplicate execution", async () => {
    let release!: () => void;
    const scheduler = new AosScheduler();
    scheduler.register(task, () => new Promise<void>((resolve) => { release = resolve; }));
    const running = scheduler.trigger(task.id);
    await expect(scheduler.trigger(task.id)).rejects.toThrow("already running");
    release();
    await expect(running).resolves.toMatchObject({ status: "succeeded" });
  });
});

describe("Capability Registry", () => {
  it("validates, loads and filters capabilities without credentials", () => {
    const registry = new CapabilityRegistry(coreCapabilities);
    expect(registry.search("Radar", { mode: "online" }).map((item) => item.id)).toEqual(["radar.cached-feed"]);
    expect(JSON.stringify(registry.search())).not.toMatch(/token|secret|password/i);
    expect(() => registry.register({ id: "unsafe", documentationUrl: "https://outside.example" })).toThrow("Invalid capability");
  });
});
