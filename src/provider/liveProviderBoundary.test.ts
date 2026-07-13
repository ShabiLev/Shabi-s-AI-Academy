import { describe, expect, it } from "vitest";
import { liveProviderStatus, MAX_LIVE_INPUT_CHARS, validateLiveProviderRequest } from "./liveProviderBoundary";
describe("live provider boundary", () => {
  it("remains disabled in the browser by default", () => { expect(liveProviderStatus.executable).toBe(false); expect(liveProviderStatus.reason).toContain("server"); });
  it("requires consent and allowlisted server-side provider IDs", () => { expect(validateLiveProviderRequest({ input: "safe", providerId: "unknown", consent: false })).toEqual({ valid: false, errors: ["unsupportedProvider", "consentRequired"] }); });
  it("rejects missing and oversized input", () => { expect(validateLiveProviderRequest({ input: "", providerId: "openai-reserved", consent: true }).errors).toContain("inputRequired"); expect(validateLiveProviderRequest({ input: "x".repeat(MAX_LIVE_INPUT_CHARS + 1), providerId: "openai-reserved", consent: true }).errors).toContain("inputTooLarge"); });
  it("accepts only a structurally safe request contract", () => { expect(validateLiveProviderRequest({ input: "local prompt", providerId: "openai-reserved", consent: true })).toEqual({ valid: true, errors: [] }); });
});
