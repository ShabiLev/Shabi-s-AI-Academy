/* eslint-disable react-refresh/only-export-components -- context and hook share one boundary. */
import { createContext, useContext, useState, type ReactNode } from "react";
import { CapabilityRegistry } from "./capabilityRegistry";
import { coreCapabilities } from "./catalog";
import { AosEventBus } from "./eventBus";
import { AosScheduler } from "./scheduler";

interface AosCoreValue {
  eventBus: AosEventBus;
  scheduler: AosScheduler;
  registry: CapabilityRegistry;
}

const Context = createContext<AosCoreValue | null>(null);

export function AosCoreProvider({ children }: { children: ReactNode }) {
  const [value] = useState<AosCoreValue>(() => {
    const eventBus = new AosEventBus();
    const scheduler = new AosScheduler();
    scheduler.register({
      id: "radar.public-feed-refresh", title: "AI Radar public feed refresh",
      schedule: { kind: "github-actions", expression: "17 */6 * * *" }, enabled: true,
      timeoutMs: 60_000, retry: { maxAttempts: 2, delayMs: 1_000 }, concurrency: "skip", permission: "network-read",
    }, async () => { /* The browser only simulates metadata; GitHub Actions owns scheduled execution. */ });
    return {
      eventBus,
      scheduler,
      registry: new CapabilityRegistry(coreCapabilities),
    };
  });
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAosCore(): AosCoreValue {
  const value = useContext(Context);
  if (!value) throw new Error("useAosCore must be used within AosCoreProvider");
  return value;
}
