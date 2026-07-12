import type { RetryPolicy } from "../types";
import { validateRetryPolicy } from "../runtimeValidation";

export const defaultRetryPolicy: RetryPolicy = {
  maxAttempts: 2,
  retryableErrorCodes: ["MOCK_RETRYABLE"],
  backoffStrategy: "none",
  fallbackAction: "fail",
  stopCondition: "Stop after maxAttempts or a non-retryable error.",
};

export function createRetryPolicy(
  input: Partial<RetryPolicy> = {},
): RetryPolicy {
  const policy = { ...defaultRetryPolicy, ...input };
  const validation = validateRetryPolicy(
    policy.maxAttempts,
    policy.stopCondition,
  );
  if (!validation.valid)
    throw new Error(validation.issues.map((issue) => issue.message).join(" "));
  return policy;
}
