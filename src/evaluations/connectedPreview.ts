import type { ConnectedActionPreview, LocalizedText } from "./types";
import { validatePreview } from "./validation";

export const PREVIEW_ONLY_CONNECTORS = ["github", "jira", "confluence", "gmail", "calendar", "codex"] as const;

export function createConnectedPreview(input: {
  id: string;
  connectorType: string;
  actionType: string;
  targetSummary: string;
  payloadSummary: LocalizedText;
  requiredPermissions: string[];
  riskLevel: ConnectedActionPreview["riskLevel"];
  reversible: boolean;
  recoveryPlan?: LocalizedText;
  createdAt: string;
  expiresAt: string;
}): ConnectedActionPreview {
  const supported = PREVIEW_ONLY_CONNECTORS.includes(input.connectorType as typeof PREVIEW_ONLY_CONNECTORS[number]);
  const preview: ConnectedActionPreview = {
    schemaVersion: 1,
    id: input.id,
    connectorType: input.connectorType,
    actionType: input.actionType,
    targetSummary: input.targetSummary,
    payloadSummary: input.payloadSummary,
    requiredPermissions: input.requiredPermissions,
    riskLevel: input.riskLevel,
    reversible: input.reversible,
    recoveryPlan: input.recoveryPlan,
    status: "unavailable",
    createdAt: input.createdAt,
    expiresAt: input.expiresAt,
  };
  if (!supported || !validatePreview(preview)) throw new Error("Invalid connected action preview.");
  return preview;
}

export function executeConnectedPreview(): never {
  throw new Error("Connected actions are preview-only in Version 1.9.");
}

export function expireConnectedPreview(preview: ConnectedActionPreview, now: string): ConnectedActionPreview {
  return Date.parse(now) >= Date.parse(preview.expiresAt) ? { ...preview, status: "expired" } : preview;
}
