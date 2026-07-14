import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { DataProvider } from "./DataProvider";
import { HybridDataProvider } from "./HybridDataProvider";
import { LocalDataProvider } from "./LocalDataProvider";
import { MAX_SYNC_QUEUE, enqueueSync, readSyncQueue } from "./sync/syncQueue";
import type { DataRecord, SyncMutation, SyncStatus } from "./types";

function memoryStorage() { const values = new Map<string,string>(); return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string,value: string) => { values.set(key,value); } }; }
const record = (id: string): DataRecord => ({ id, createdAt: "2026-07-14T00:00:00.000Z", updatedAt: "2026-07-14T00:00:00.000Z", schemaVersion: 1 });

describe("data providers", () => {
  it("persists local domain records without mixing domains", async () => {
    const provider = new LocalDataProvider(memoryStorage());
    await provider.upsert("prompts",record("one"));
    expect((await provider.list("prompts")).data).toHaveLength(1);
    expect((await provider.list("agents")).data).toEqual([]);
    await provider.remove("prompts","one");
    expect((await provider.list("prompts")).data).toEqual([]);
  });
  it("writes locally first and reports synchronized only after confirmed remote flush", async () => {
    const storage = memoryStorage(); const local = new LocalDataProvider(storage); let remoteWrites = 0;
    const cloud: DataProvider = { mode: "cloud", list: async () => ({ ok: true, data: [] }), upsert: async (_domain,item) => { remoteWrites += 1; return { ok: true, data: item }; }, remove: async () => ({ ok: true, data: undefined }), getStatus: () => "synchronized" };
    const hybrid = new HybridDataProvider(local,cloud,storage);
    await hybrid.upsert("projects",record("project-1"));
    expect(hybrid.getStatus()).toBe("pending");
    expect((await local.list("projects")).data).toHaveLength(1);
    expect(await hybrid.flush(new Date("2099-07-14T01:00:00.000Z"))).toBe("synchronized");
    expect(remoteWrites).toBe(1);
  });
  it("retains failed mutations with bounded backoff instead of polling", async () => {
    const storage = memoryStorage(); const local = new LocalDataProvider(storage);
    const cloud: DataProvider = { mode: "cloud", list: async () => ({ ok: false, error: "failed" }), upsert: async () => ({ ok: false, error: "failed" }), remove: async () => ({ ok: false, error: "failed" }), getStatus: (): SyncStatus => "failed" };
    const hybrid = new HybridDataProvider(local,cloud,storage);
    await hybrid.upsert("agents",record("agent-1"));
    expect(await hybrid.flush(new Date("2099-07-14T01:00:00.000Z"))).toBe("failed");
    expect(readSyncQueue(storage)[0].attempts).toBe(1);
  });
});

describe("sync queue", () => {
  it("is idempotent and capped at 100 entries", () => {
    const storage = memoryStorage();
    const base = (id: string): SyncMutation => ({ id,domain:"prompts",operation:"remove",recordId:id,createdAt:"now",attempts:0,nextAttemptAt:"now" });
    for (let i=0;i<MAX_SYNC_QUEUE+5;i+=1) enqueueSync(base(String(i)),storage);
    enqueueSync({ ...base("104"), attempts: 3 },storage);
    expect(readSyncQueue(storage)).toHaveLength(MAX_SYNC_QUEUE);
    expect(readSyncQueue(storage).at(-1)?.attempts).toBe(3);
  });
});

describe("database ownership migration", () => {
  it("enables RLS and ownership policies for every private table", () => {
    const sql = readFileSync(resolve(process.cwd(),"supabase/migrations/202607140001_user_data_foundation.sql"),"utf8");
    for (const table of ["profiles","user_preferences","user_progress","user_prompts","user_agents","projects","project_entities","knowledge_documents","workflows","runtime_runs","favorites","recent_items","notifications","onboarding_profiles","sync_metadata","audit_events","account_roles"]) expect(sql).toContain(table);
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("auth.uid() = user_id");
    expect(sql).toContain("auth.uid() = id");
    expect(sql).not.toContain("using (true)");
  });
});
