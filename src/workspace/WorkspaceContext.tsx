/* eslint-disable react-refresh/only-export-components -- provider and hook form one local workspace boundary. */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { loadWorkspaceState, resetWorkspaceDomain, sanitizeAnalyticsCategory, saveWorkspaceState } from "./workspaceStorage";
import type { AnalyticsEventType, EntityActivity, WorkspaceNotification, WorkspaceState } from "./types";
interface Value { state: WorkspaceState; unreadCount: number; recordActivity: (input: Omit<EntityActivity,"id"|"timestamp">) => void; togglePreference: (entityId: string, entityType: EntityActivity["entityType"], field: "favorite"|"pinned") => void; addNotification: (input: Omit<WorkspaceNotification,"id"|"createdAt"|"read">) => void; markRead: (id: string) => void; markAllRead: () => void; deleteNotification: (id: string) => void; track: (type: AnalyticsEventType, metadata?: { category?: string; quality?: number }) => void; setAnalyticsEnabled: (enabled: boolean) => void; reset: (domain: "activity"|"preferences"|"notifications"|"analytics") => void }
const Context = createContext<Value | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadWorkspaceState); const { pathname } = useLocation();
  const mutate = (fn: (value: WorkspaceState) => WorkspaceState) => setState((current) => { const next = fn(current); saveWorkspaceState(next); return next; });
  const track = (type: AnalyticsEventType, metadata: { category?: string; quality?: number } = {}) => mutate((current) => current.analyticsEnabled ? { ...current, analytics: [...current.analytics, { id: crypto.randomUUID(), type, timestamp: new Date().toISOString(), ...(sanitizeAnalyticsCategory(metadata.category) ? { category: sanitizeAnalyticsCategory(metadata.category) } : {}), ...(typeof metadata.quality === "number" && metadata.quality >= 0 && metadata.quality <= 100 ? { quality: metadata.quality } : {}) }].slice(-1000) } : current);
  // Route changes are the external navigation signal that this local telemetry adapter records.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { const segment = pathname.split("/")[1] || "dashboard"; const entityTypes: Record<string, EntityActivity["entityType"]> = { lessons: "lesson", prompts: "prompt", agents: "agent", projects: "project", knowledge: "document", runs: "run", workflows: "workflow", missions: "mission", team: "team", evaluations: "evaluation", "evaluation-suites": "suite", failures: "failureCase", "how-to": "help", docs: "documentation" }; const entityType = entityTypes[segment]; mutate((current) => { const analytics = current.analyticsEnabled ? [...current.analytics, { id: crypto.randomUUID(), type: "routeViewed" as const, timestamp: new Date().toISOString(), category: segment }].slice(-1000) : current.analytics; if (!entityType) return { ...current, analytics }; const activity = { id: crypto.randomUUID(), entityId: pathname, entityType, kind: "opened" as const, title: pathname, route: pathname, timestamp: new Date().toISOString() }; return { ...current, analytics, activities: [...current.activities.filter((item) => !(item.entityId === pathname && item.kind === "opened")), activity].slice(-200) }; }); }, [pathname]);
  const value: Value = { state, unreadCount: state.notifications.filter((item) => !item.read).length,
    recordActivity: (input) => mutate((current) => ({ ...current, activities: [...current.activities.filter((item) => !(item.entityId === input.entityId && item.kind === input.kind)), { ...input, id: crypto.randomUUID(), timestamp: new Date().toISOString() }].slice(-200) })),
    togglePreference: (entityId, entityType, field) => mutate((current) => { const old = current.preferences.find((item) => item.entityId === entityId && item.entityType === entityType) ?? { entityId, entityType, favorite: false, pinned: false, updatedAt: "" }; return { ...current, preferences: [...current.preferences.filter((item) => !(item.entityId === entityId && item.entityType === entityType)), { ...old, [field]: !old[field], updatedAt: new Date().toISOString() }].slice(-500) }; }),
    addNotification: (input) => mutate((current) => ({ ...current, notifications: [...current.notifications, { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString(), read: false }].slice(-100) })),
    markRead: (id) => mutate((current) => ({ ...current, notifications: current.notifications.map((item) => item.id === id ? { ...item, read: true } : item) })), markAllRead: () => mutate((current) => ({ ...current, notifications: current.notifications.map((item) => ({ ...item, read: true })) })), deleteNotification: (id) => mutate((current) => ({ ...current, notifications: current.notifications.filter((item) => item.id !== id) })), track,
    setAnalyticsEnabled: (analyticsEnabled) => {
      if (!analyticsEnabled) {
        try {
          const actor = (localStorage.getItem("shabis-ai-academy:mission-actor:v1") ?? "local-guest").toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(0, 80) || "local-guest";
          localStorage.removeItem(`shabis-ai-academy:mission-analytics:v1:${actor}`);
        } catch { /* Consent withdrawal still clears in-memory analytics when storage is unavailable. */ }
      }
      mutate((current) => ({ ...current, analyticsEnabled, analytics: analyticsEnabled ? current.analytics : [] }));
    }, reset: (domain) => mutate((current) => resetWorkspaceDomain(domain, current)),
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useWorkspace() { const value = useContext(Context); if (!value) throw new Error("Missing WorkspaceProvider"); return value; }
