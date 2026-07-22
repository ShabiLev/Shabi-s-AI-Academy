export type SchedulerPermission = "local-read" | "local-write" | "network-read" | "external-write";
export type SchedulerStatus = "idle" | "running" | "succeeded" | "failed" | "timed-out" | "disabled";
export type ConcurrencyPolicy = "skip" | "queue-one";

export interface SchedulerRetryPolicy {
  readonly maxAttempts: number;
  readonly delayMs: number;
}
export interface ScheduledTaskDefinition {
  readonly id: string;
  readonly title: string;
  readonly schedule: { readonly kind: "manual" | "github-actions"; readonly expression?: string };
  readonly enabled: boolean;
  readonly timeoutMs: number;
  readonly retry: SchedulerRetryPolicy;
  readonly concurrency: ConcurrencyPolicy;
  readonly permission: SchedulerPermission;
}

export interface BackgroundJobRecord {
  readonly id: string;
  readonly taskId: string;
  readonly status: Exclude<SchedulerStatus, "idle" | "disabled">;
  readonly attempt: number;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly message?: string;
}

export interface SchedulerTaskState {
  readonly task: ScheduledTaskDefinition;
  readonly status: SchedulerStatus;
  readonly lastRun?: BackgroundJobRecord;
  readonly nextRun?: string;
}

type TaskHandler = (signal: AbortSignal) => Promise<void>;

interface SchedulerOptions {
  now?: () => string;
  createId?: () => string;
  sleep?: (durationMs: number) => Promise<void>;
  historyLimit?: number;
}

function validateTask(task: ScheduledTaskDefinition): void {
  if (!/^[a-z][a-z0-9.-]{2,79}$/.test(task.id)) throw new Error("Invalid scheduled task id");
  if (!task.title.trim() || task.title.length > 120) throw new Error("Invalid scheduled task title");
  if (task.timeoutMs < 100 || task.timeoutMs > 15 * 60_000) throw new Error("Invalid scheduled task timeout");
  if (!Number.isInteger(task.retry.maxAttempts) || task.retry.maxAttempts < 1 || task.retry.maxAttempts > 3) throw new Error("Invalid retry attempts");
  if (task.retry.delayMs < 0 || task.retry.delayMs > 60_000) throw new Error("Invalid retry delay");
  if (task.schedule.kind === "github-actions" && !task.schedule.expression?.trim()) throw new Error("GitHub Actions schedule requires an expression");
}

export class AosScheduler {
  private readonly tasks = new Map<string, { definition: ScheduledTaskDefinition; handler: TaskHandler }>();
  private readonly states = new Map<string, SchedulerTaskState>();
  private readonly records: BackgroundJobRecord[] = [];
  private readonly running = new Set<string>();
  private readonly now: () => string;
  private readonly createId: () => string;
  private readonly sleep: (durationMs: number) => Promise<void>;
  private readonly historyLimit: number;

  constructor(options: SchedulerOptions = {}) {
    this.now = options.now ?? (() => new Date().toISOString());
    this.createId = options.createId ?? (() => crypto.randomUUID());
    this.sleep = options.sleep ?? ((durationMs) => new Promise((resolve) => setTimeout(resolve, durationMs)));
    this.historyLimit = Math.min(Math.max(options.historyLimit ?? 50, 1), 200);
  }

  register(definition: ScheduledTaskDefinition, handler: TaskHandler): void {
    validateTask(definition);
    if (this.tasks.has(definition.id)) throw new Error(`Scheduled task already registered: ${definition.id}`);
    this.tasks.set(definition.id, { definition, handler });
    this.states.set(definition.id, { task: definition, status: definition.enabled ? "idle" : "disabled" });
  }

  list(): readonly SchedulerTaskState[] {
    return [...this.states.values()].map((state) => ({ ...state, task: { ...state.task } }));
  }

  history(): readonly BackgroundJobRecord[] {
    return this.records.map((record) => ({ ...record }));
  }

  async trigger(taskId: string): Promise<BackgroundJobRecord> {
    const registered = this.tasks.get(taskId);
    if (!registered) throw new Error(`Unknown scheduled task: ${taskId}`);
    if (!registered.definition.enabled) throw new Error(`Scheduled task is disabled: ${taskId}`);
    if (this.running.has(taskId)) throw new Error(`Scheduled task is already running: ${taskId}`);

    this.running.add(taskId);
    this.states.set(taskId, { task: registered.definition, status: "running", lastRun: this.states.get(taskId)?.lastRun });
    let finalRecord: BackgroundJobRecord | undefined;
    try {
      for (let attempt = 1; attempt <= registered.definition.retry.maxAttempts; attempt += 1) {
        const startedAt = this.now();
        const controller = new AbortController();
        let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([
            registered.handler(controller.signal),
            new Promise<never>((_, reject) => {
              timeoutHandle = setTimeout(() => { controller.abort(); reject(new Error("Task timed out")); }, registered.definition.timeoutMs);
            }),
          ]);
          finalRecord = { id: this.createId(), taskId, status: "succeeded", attempt, startedAt, finishedAt: this.now() };
          break;
        } catch (error) {
          const timedOut = controller.signal.aborted;
          finalRecord = { id: this.createId(), taskId, status: timedOut ? "timed-out" : "failed", attempt, startedAt, finishedAt: this.now(), message: error instanceof Error ? error.message.slice(0, 240) : "Task failed" };
          if (attempt < registered.definition.retry.maxAttempts) await this.sleep(registered.definition.retry.delayMs);
        } finally {
          if (timeoutHandle) clearTimeout(timeoutHandle);
        }
      }
    } finally {
      this.running.delete(taskId);
    }

    if (!finalRecord) throw new Error("Scheduled task did not produce a result");
    this.records.push(finalRecord);
    if (this.records.length > this.historyLimit) this.records.splice(0, this.records.length - this.historyLimit);
    this.states.set(taskId, { task: registered.definition, status: finalRecord.status, lastRun: finalRecord });
    return finalRecord;
  }
}
