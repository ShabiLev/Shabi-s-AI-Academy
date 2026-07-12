import { normalizeRuntimeText, validateRunRequest } from "../runtimeValidation";
import type { ProviderRunResponse, RunContext } from "../types";
import type { RuntimeProvider } from "./types";

export const MOCK_FIXTURE_VERSION = "runtime-mock-v1";

export class MockProvider implements RuntimeProvider {
  readonly id = "mock";
  private readonly cancelled = new Set<string>();
  getStatus() {
    return {
      id: this.id,
      name: "Mock Provider",
      status: "mockReady" as const,
      capabilities: [
        "deterministic-output",
        "approval-simulation",
        "retry-simulation",
      ],
      reason: "Available for browser-local deterministic simulation.",
    };
  }
  validate = validateRunRequest;
  async execute(context: RunContext): Promise<ProviderRunResponse> {
    const { request } = context;
    if (this.cancelled.has(request.id) || context.isCancelled())
      return {
        outcome: "cancelled",
        safeSummary: "The local Mock run was cancelled.",
        warnings: [],
      };
    const normalized = normalizeRuntimeText(request.input);
    const base = `Simulated result [${MOCK_FIXTURE_VERSION}] for: ${normalized}`;
    switch (request.scenario) {
      case "validationFailure":
        return {
          outcome: "validationFailure",
          safeSummary: "Mock validation failed.",
          warnings: ["The supplied scenario intentionally failed validation."],
          errorCode: "MOCK_VALIDATION",
        };
      case "retryThenSuccess":
        return context.attempt === 1
          ? {
              outcome: "retryableFailure",
              safeSummary: "A deterministic retry is required.",
              warnings: [],
              errorCode: "MOCK_RETRYABLE",
            }
          : {
              outcome: "success",
              output: base,
              safeSummary: "The Mock retry completed.",
              warnings: ["Output is simulated."],
            };
      case "retryExhausted":
        return {
          outcome: "retryableFailure",
          safeSummary: "The deterministic retry failed.",
          warnings: [],
          errorCode: "MOCK_RETRYABLE",
        };
      case "approvalRequired":
      case "approvalRejected":
        return {
          outcome: "approvalRequired",
          safeSummary: "Explicit approval is required.",
          warnings: ["No external tool will be executed."],
        };
      case "cancelled":
        return {
          outcome: "cancelled",
          safeSummary: "The local Mock run was cancelled.",
          warnings: [],
        };
      default:
        return {
          outcome: "success",
          output: base,
          safeSummary: "The Mock run completed.",
          warnings: ["Output is simulated; no external service was called."],
        };
    }
  }
  async cancel(runId: string) {
    this.cancelled.add(runId);
  }
}
