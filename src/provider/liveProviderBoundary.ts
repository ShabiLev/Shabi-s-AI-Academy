export const MAX_LIVE_INPUT_CHARS = 12_000;
export interface LiveProviderRequest { input: string; providerId: string; consent: boolean }
export interface LiveProviderValidation { valid: boolean; errors: string[] }

export function validateLiveProviderRequest(value: unknown): LiveProviderValidation {
  const errors: string[] = [];
  if (!value || typeof value !== "object") return { valid: false, errors: ["invalidRequest"] };
  const request = value as Partial<LiveProviderRequest>;
  if (typeof request.input !== "string" || !request.input.trim()) errors.push("inputRequired");
  else if (request.input.length > MAX_LIVE_INPUT_CHARS) errors.push("inputTooLarge");
  if (typeof request.providerId !== "string" || !["openai-reserved"].includes(request.providerId)) errors.push("unsupportedProvider");
  if (request.consent !== true) errors.push("consentRequired");
  return { valid: errors.length === 0, errors };
}

export const liveProviderStatus = {
  browserEnabled: import.meta.env.VITE_LIVE_PROVIDER_ENABLED === "true",
  executable: false,
  reason: "A browser flag alone never enables Live execution. A configured server adapter is not shipped in this beta.",
} as const;
