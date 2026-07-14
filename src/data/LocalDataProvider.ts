import type { DataProvider } from "./DataProvider";
import type { DataDomain, DataRecord, DataResult } from "./types";
const key = (domain: DataDomain) => `shabis-ai-academy.data.${domain}.v1`;
function read(storage: Pick<Storage,"getItem">, domain: DataDomain): DataRecord[] { try { const value: unknown = JSON.parse(storage.getItem(key(domain)) ?? "[]"); return Array.isArray(value) ? value.filter((item): item is DataRecord => Boolean(item && typeof item === "object" && typeof (item as DataRecord).id === "string")) : []; } catch { return []; } }
export class LocalDataProvider implements DataProvider {
  readonly mode = "local" as const;
  constructor(private readonly storage: Pick<Storage,"getItem"|"setItem"> = localStorage) {}
  async list(domain: DataDomain): Promise<DataResult<DataRecord[]>> { return { ok: true, data: read(this.storage, domain) }; }
  async upsert(domain: DataDomain, record: DataRecord): Promise<DataResult<DataRecord>> { const items = read(this.storage, domain); const index = items.findIndex((item) => item.id === record.id); const next = { ...record, updatedAt: new Date().toISOString() }; if (index >= 0) items[index] = next; else items.push(next); this.storage.setItem(key(domain), JSON.stringify(items)); return { ok: true, data: next }; }
  async remove(domain: DataDomain, id: string): Promise<DataResult<void>> { this.storage.setItem(key(domain), JSON.stringify(read(this.storage, domain).filter((item) => item.id !== id))); return { ok: true, data: undefined }; }
  getStatus() { return "local-only" as const; }
}
