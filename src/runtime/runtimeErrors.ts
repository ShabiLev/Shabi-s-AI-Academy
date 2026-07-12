import type { RuntimeError, RuntimeErrorCode, RuntimeLayer } from "./types";

export function runtimeError(
  code: RuntimeErrorCode,
  safeMessage: string,
  affectedLayer: RuntimeLayer,
  retryable = false,
  recoveryAction = "Review the request and try again.",
  developerDetail?: string,
): RuntimeError {
  return {
    code,
    messageKey: `runtime.error.${code}`,
    safeMessage,
    retryable,
    affectedLayer,
    recoveryAction,
    ...(developerDetail ? { developerDetail } : {}),
  };
}

export function safeRuntimeError(value: unknown): RuntimeError {
  if (
    value &&
    typeof value === "object" &&
    "code" in value &&
    "safeMessage" in value
  )
    return value as RuntimeError;
  return runtimeError(
    "internalRuntimeError",
    "The Runtime could not complete this local operation.",
    "runtime",
    false,
    "Try again or clear the affected Runtime record.",
  );
}
