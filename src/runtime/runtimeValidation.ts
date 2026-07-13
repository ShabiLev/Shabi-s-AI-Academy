import type { RunRequest, ValidationIssue, ValidationOutcome } from "./types";

const secretFields = /api.?key|secret|password|token|credential/i;

export function normalizeRuntimeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function validateRunRequest(request: RunRequest): ValidationOutcome {
  const issues: ValidationIssue[] = [];
  if (!request.id.trim())
    issues.push({
      field: "id",
      code: "required",
      message: "Run ID is required.",
    });
  if (!request.input.trim())
    issues.push({
      field: "input",
      code: "required",
      message: "Input is required.",
    });
  if (request.mode === "liveReserved")
    issues.push({
      field: "mode",
      code: "providerNotConfigured",
      message: "Live execution is not available in Version 1.2.0-beta.1.",
    });
  if (request.mode === "mock" && request.providerId !== "mock")
    issues.push({
      field: "providerId",
      code: "unknownProvider",
      message: "Mock runs require the Mock Provider.",
    });
  const unsafeVariable = Object.keys(request.variables).find((key) =>
    secretFields.test(key),
  );
  if (unsafeVariable)
    issues.push({
      field: `variables.${unsafeVariable}`,
      code: "secretField",
      message: "Secret-like fields are not accepted.",
    });
  return { valid: issues.length === 0, issues };
}

export function validateRetryPolicy(
  maxAttempts: number,
  stopCondition: string,
): ValidationOutcome {
  const issues: ValidationIssue[] = [];
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 3)
    issues.push({
      field: "maxAttempts",
      code: "range",
      message: "Attempts must be an integer from 1 to 3.",
    });
  if (maxAttempts > 1 && !stopCondition.trim())
    issues.push({
      field: "stopCondition",
      code: "required",
      message: "A stop condition is required when retry is enabled.",
    });
  return { valid: issues.length === 0, issues };
}
