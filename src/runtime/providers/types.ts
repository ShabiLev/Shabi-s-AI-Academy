import type {
  ProviderRunResponse,
  ProviderStatus,
  RunContext,
  RunRequest,
  ValidationOutcome,
} from "../types";
export interface RuntimeProvider {
  readonly id: string;
  getStatus(): ProviderStatus;
  validate(request: RunRequest): ValidationOutcome;
  execute(context: RunContext): Promise<ProviderRunResponse>;
  cancel(runId: string): Promise<void>;
}
