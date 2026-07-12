import {
  createApprovalRequest,
  decideApproval,
} from "./approvals/approvalService";
import { runtimeError, safeRuntimeError } from "./runtimeErrors";
import type { RuntimeFactory } from "./runtimeFactory";
import { RuntimeHistory } from "./runtimeHistory";
import { transitionRuntime } from "./runtimeStateMachine";
import { normalizeRuntimeText, validateRunRequest } from "./runtimeValidation";
import { defaultRetryPolicy } from "./retry/retryPolicy";
import { ToolRegistry } from "./tools/ToolRegistry";
import {
  RUNTIME_SCHEMA_VERSION,
  RUNTIME_VERSION,
  type DryRunPreview,
  type RunRequest,
  type RuntimeHistoryRecord,
  type RuntimeState,
} from "./types";
import { ProviderRegistry } from "./providers/ProviderRegistry";

export class RuntimeEngine {
  private readonly active = new Map<string, RuntimeHistoryRecord>();
  constructor(
    private readonly providers: ProviderRegistry,
    private readonly tools: ToolRegistry,
    private readonly history: RuntimeHistory,
    private readonly factory: RuntimeFactory,
  ) {}
  getRuns() {
    return this.history.list();
  }
  getRun(id: string) {
    return this.active.get(id) ?? this.history.get(id);
  }
  getProviderStatuses() {
    return this.providers.statuses();
  }
  getStorageWarning() {
    return this.history.warning;
  }
  deleteRun(id: string) {
    this.active.delete(id);
    return this.history.delete(id);
  }
  clearHistory() {
    this.active.clear();
    return this.history.clear();
  }

  private initial(request: RunRequest): RuntimeHistoryRecord {
    const state: RuntimeState = { status: "draft", events: [] };
    return {
      schemaVersion: RUNTIME_SCHEMA_VERSION,
      runtimeVersion: RUNTIME_VERSION,
      id: request.id,
      request,
      result: {
        status: "draft",
        validation: validateRunRequest(request),
        attempts: 0,
        warnings: [],
        events: state.events,
      },
      createdAt: request.requestedAt,
      updatedAt: request.requestedAt,
    };
  }
  private move(
    record: RuntimeHistoryRecord,
    status: RuntimeState["status"],
    summary: string,
    details?: Record<string, string | number | boolean>,
  ) {
    const moved = transitionRuntime(
      { status: record.result.status, events: record.result.events },
      status,
      record.id,
      summary,
      this.factory,
      details,
    );
    if (!moved.ok) return moved;
    record.result = { ...record.result, status, events: moved.state.events };
    record.updatedAt = this.factory.now();
    return moved;
  }
  private persist(record: RuntimeHistoryRecord) {
    this.active.set(record.id, record);
    this.history.upsert(structuredClone(record));
    return record;
  }

  createDryRun(request: RunRequest) {
    const record = this.initial(request);
    if (!record.result.validation.valid) {
      record.result.error = runtimeError(
        request.mode === "liveReserved"
          ? "providerNotConfigured"
          : "validationFailed",
        record.result.validation.issues[0]?.message ??
          "Runtime validation failed.",
        "validation",
      );
      this.move(
        record,
        "cancelled",
        "The unavailable or invalid run was not started.",
      );
      return this.persist(record);
    }
    const providerStatus =
      request.mode === "dryRun"
        ? this.providers.statuses().find((status) => status.id === "mock")!
        : this.providers
            .statuses()
            .find((status) => status.id === request.providerId)!;
    const describedTools = this.tools.describe(request.plannedToolIds);
    const preview: DryRunPreview = {
      label: "Dry Run preview — no provider or external tool was executed.",
      assembledPrompt: [request.systemInstruction.trim(), request.input.trim()]
        .filter(Boolean)
        .join("\n\n"),
      normalizedInput: normalizeRuntimeText(request.input),
      variables: { ...request.variables },
      plannedTools: describedTools.map(
        (tool) => `${tool.name.en}: Planned tool only — not connected.`,
      ),
      approvalPoints: describedTools
        .filter((tool) => tool.requiresApproval)
        .map((tool) => tool.name.en),
      estimatedSteps: [
        "Validate request",
        "Assemble prompt",
        "Review planned tools",
        "Stop before execution",
      ],
      warnings: [
        "This preview is not an AI result.",
        "Do not enter sensitive information.",
      ],
      providerStatus,
      privacyNotice: "Browser-local only. No data was sent externally.",
    };
    this.move(record, "completed", "Dry Run preview completed locally.");
    record.result = {
      ...record.result,
      dryRunPreview: preview,
      completedAt: this.factory.now(),
      warnings: preview.warnings,
    };
    return this.persist(record);
  }

  async startMock(request: RunRequest) {
    const record = this.initial(request);
    if (!record.result.validation.valid) {
      record.result.error = runtimeError(
        "validationFailed",
        record.result.validation.issues[0]?.message ??
          "Runtime validation failed.",
        "validation",
      );
      this.move(record, "cancelled", "The invalid Mock run was cancelled.");
      return this.persist(record);
    }
    const providerResult = this.providers.get(request.providerId);
    if (!providerResult.ok) {
      record.result.error = providerResult.error;
      this.move(
        record,
        "cancelled",
        "The unknown provider prevented execution.",
      );
      return this.persist(record);
    }
    this.move(record, "queued", "Mock run queued.");
    this.move(record, "running", "Mock Provider started locally.");
    record.result.startedAt = this.factory.now();
    this.active.set(record.id, record);

    try {
      for (
        let attempt = 1;
        attempt <= defaultRetryPolicy.maxAttempts;
        attempt += 1
      ) {
        record.result.attempts = attempt;
        const response = await providerResult.provider.execute({
          request,
          normalizedInput: normalizeRuntimeText(request.input),
          attempt,
          now: this.factory.now,
          nextId: this.factory.nextId,
          isCancelled: () =>
            this.active.get(record.id)?.result.status === "cancelled",
        });
        if (this.active.get(record.id)?.result.status === "cancelled")
          return this.persist(record);
        record.result.warnings = response.warnings;
        if (response.outcome === "approvalRequired") {
          this.move(
            record,
            "waitingForApproval",
            "Run is waiting for explicit approval.",
          );
          record.result.approval = createApprovalRequest({
            id: this.factory.nextId(),
            runId: record.id,
            requestedAt: this.factory.now(),
          });
          return this.persist(record);
        }
        if (response.outcome === "retryableFailure") {
          if (attempt < defaultRetryPolicy.maxAttempts) {
            this.move(
              record,
              "retrying",
              "A deterministic retry was scheduled.",
              {
                attempt,
                maxAttempts: defaultRetryPolicy.maxAttempts,
                failureCode: response.errorCode ?? "MOCK_RETRYABLE",
                nextDecision: "retry",
              },
            );
            this.move(record, "running", "Mock retry started.", {
              attempt: attempt + 1,
            });
            continue;
          }
          this.move(record, "retrying", "Retry attempts were exhausted.", {
            attempt,
            maxAttempts: defaultRetryPolicy.maxAttempts,
            failureCode: response.errorCode ?? "MOCK_RETRYABLE",
            nextDecision: "fail",
          });
          this.move(
            record,
            "failed",
            "Mock run failed after retry exhaustion.",
          );
          record.result.error = runtimeError(
            "retryExhausted",
            "The Mock retry limit was reached.",
            "retry",
            false,
            "Review the request before starting another run.",
          );
          record.result.completedAt = this.factory.now();
          return this.persist(record);
        }
        if (response.outcome === "cancelled") {
          await this.cancel(record.id, "Mock scenario requested cancellation.");
          return this.getRun(record.id) ?? this.persist(record);
        }
        if (
          response.outcome === "validationFailure" ||
          response.outcome === "failure"
        ) {
          this.move(record, "failed", response.safeSummary);
          record.result.error = runtimeError(
            "validationFailed",
            response.safeSummary,
            "provider",
          );
          record.result.completedAt = this.factory.now();
          return this.persist(record);
        }
        this.move(record, "completed", response.safeSummary);
        record.result.output = response.output;
        record.result.completedAt = this.factory.now();
        return this.persist(record);
      }
    } catch (error) {
      this.move(record, "failed", "The local Runtime failed safely.");
      record.result.error = safeRuntimeError(error);
      record.result.completedAt = this.factory.now();
    }
    return this.persist(record);
  }

  approve(runId: string) {
    const record = this.getRun(runId);
    if (
      !record ||
      record.result.status !== "waitingForApproval" ||
      !record.result.approval
    )
      return undefined;
    record.result.approval = decideApproval(
      record.result.approval,
      "approved",
      this.factory.now(),
    );
    this.move(record, "running", "Approval granted for this local run only.");
    this.move(record, "completed", "Approved Mock simulation completed.");
    record.result.output = `Simulated approved result for: ${normalizeRuntimeText(record.request.input)}`;
    record.result.completedAt = this.factory.now();
    return this.persist(record);
  }
  reject(runId: string) {
    const record = this.getRun(runId);
    if (
      !record ||
      record.result.status !== "waitingForApproval" ||
      !record.result.approval
    )
      return undefined;
    record.result.approval = decideApproval(
      record.result.approval,
      "rejected",
      this.factory.now(),
    );
    record.result.error = runtimeError(
      "approvalRejected",
      "The approval was rejected.",
      "approval",
    );
    this.move(record, "cancelled", "Approval rejected; the run was cancelled.");
    record.result.completedAt = this.factory.now();
    return this.persist(record);
  }
  async cancel(runId: string, reason = "Cancelled by the user.") {
    const record = this.getRun(runId);
    if (!record) return undefined;
    if (
      record.result.status === "cancelled" ||
      record.result.status === "completed" ||
      record.result.status === "failed"
    )
      return record;
    const provider = this.providers.get(record.request.providerId);
    if (provider.ok) await provider.provider.cancel(runId);
    this.move(record, "cancelled", reason);
    record.result.error = runtimeError(
      "cancelled",
      "The local Runtime run was cancelled.",
      "runtime",
    );
    record.result.completedAt = this.factory.now();
    return this.persist(record);
  }
}
