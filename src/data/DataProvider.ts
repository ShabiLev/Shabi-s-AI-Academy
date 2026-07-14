import type { DataDomain, DataRecord, DataResult, SyncStatus } from "./types";
export interface DataProvider { mode: "local" | "cloud" | "hybrid"; list(domain: DataDomain): Promise<DataResult<DataRecord[]>>; upsert(domain: DataDomain, record: DataRecord): Promise<DataResult<DataRecord>>; remove(domain: DataDomain, id: string): Promise<DataResult<void>>; getStatus(): SyncStatus }
