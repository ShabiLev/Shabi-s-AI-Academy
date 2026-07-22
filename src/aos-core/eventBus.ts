export interface AosEventMap {
  "radar.feed.updated": { version: 1; provider: string; itemCount: number; retrievedAt: string };
  "radar.item.saved": { version: 1; itemId: string; saved: boolean; occurredAt: string };
  "research.source.ingested": { version: 1; sourceId: string; occurredAt: string };
  "knowledge.candidate.created": { version: 1; candidateId: string; occurredAt: string };
  "prompt.catalog.updated": { version: 1; itemCount: number; occurredAt: string };
  "agent.catalog.updated": { version: 1; itemCount: number; occurredAt: string };
  "notification.created": { version: 1; notificationId: string; occurredAt: string };
  "memory.refreshed": { version: 1; occurredAt: string };
  "quality.run.completed": { version: 1; runId: string; status: "passed" | "failed" | "blocked"; occurredAt: string };
  "release.status.changed": { version: 1; status: "unverified" | "blocked" | "ready"; occurredAt: string };
}

export type AosEventName = keyof AosEventMap;

export interface AosEventRecord<K extends AosEventName = AosEventName> {
  readonly id: string;
  readonly name: K;
  readonly payload: AosEventMap[K];
  readonly publishedAt: string;
}

export interface EventDeliveryError {
  readonly eventId: string;
  readonly eventName: AosEventName;
  readonly message: string;
}

type Subscriber<K extends AosEventName> = (event: AosEventRecord<K>) => void;

interface EventBusOptions {
  historyLimit?: number;
  createId?: () => string;
  now?: () => string;
}

export class AosEventBus {
  private readonly subscribers = new Map<AosEventName, Set<Subscriber<AosEventName>>>();
  private readonly records: AosEventRecord[] = [];
  private readonly errors: EventDeliveryError[] = [];
  private readonly historyLimit: number;
  private readonly createId: () => string;
  private readonly now: () => string;

  constructor(options: EventBusOptions = {}) {
    this.historyLimit = Math.min(Math.max(options.historyLimit ?? 100, 1), 500);
    this.createId = options.createId ?? (() => crypto.randomUUID());
    this.now = options.now ?? (() => new Date().toISOString());
  }

  subscribe<K extends AosEventName>(name: K, subscriber: Subscriber<K>): () => void {
    const subscribers = this.subscribers.get(name) ?? new Set<Subscriber<AosEventName>>();
    subscribers.add(subscriber as Subscriber<AosEventName>);
    this.subscribers.set(name, subscribers);
    return () => {
      subscribers.delete(subscriber as Subscriber<AosEventName>);
      if (!subscribers.size) this.subscribers.delete(name);
    };
  }

  publish<K extends AosEventName>(name: K, payload: AosEventMap[K]): AosEventRecord<K> {
    const record: AosEventRecord<K> = { id: this.createId(), name, payload, publishedAt: this.now() };
    this.records.push(record as AosEventRecord);
    if (this.records.length > this.historyLimit) this.records.splice(0, this.records.length - this.historyLimit);

    for (const subscriber of this.subscribers.get(name) ?? []) {
      try {
        subscriber(record as AosEventRecord<AosEventName>);
      } catch (error) {
        this.errors.push({
          eventId: record.id,
          eventName: name,
          message: error instanceof Error ? error.message.slice(0, 240) : "Subscriber failed",
        });
        if (this.errors.length > this.historyLimit) this.errors.splice(0, this.errors.length - this.historyLimit);
      }
    }
    return record;
  }

  history(): readonly AosEventRecord[] {
    return this.records.map((record) => ({ ...record }));
  }

  deliveryErrors(): readonly EventDeliveryError[] {
    return this.errors.map((error) => ({ ...error }));
  }
}

