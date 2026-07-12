import type { RuntimeHistoryRecord } from "./types";
import type { RuntimeStorage } from "./runtimeStorage";
export class RuntimeHistory {
  private records: RuntimeHistoryRecord[];
  warning?: string;
  constructor(private readonly storage: RuntimeStorage) {
    const loaded = storage.load();
    this.records = loaded.records;
    this.warning = loaded.warning;
  }
  list() {
    return [...this.records].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }
  get(id: string) {
    return this.records.find((record) => record.id === id);
  }
  upsert(record: RuntimeHistoryRecord) {
    const next = [
      record,
      ...this.records.filter((item) => item.id !== record.id),
    ];
    const saved = this.storage.save(next);
    if (saved.ok) this.records = next.slice(0, 50);
    else this.warning = saved.warning;
    return saved;
  }
  delete(id: string) {
    const next = this.records.filter((record) => record.id !== id);
    const saved = this.storage.save(next);
    if (saved.ok) this.records = next;
    return saved;
  }
  clear() {
    const saved = this.storage.save([]);
    if (saved.ok) this.records = [];
    return saved;
  }
}
