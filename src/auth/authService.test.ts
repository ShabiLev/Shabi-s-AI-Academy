import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAuthService } from "./authService";

function clientWith(auth: Record<string, ReturnType<typeof vi.fn>>) { return { auth } as unknown as SupabaseClient; }
describe("auth service boundary", () => {
  it("performs no operation when optional configuration is unavailable", async () => {
    const service = createAuthService(null);
    await expect(service.signIn("a@example.com", "Password123")).resolves.toEqual({ ok: false, message: "auth-unavailable" });
  });
  it("normalizes email and delegates password login to the centralized client", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ data: {}, error: null });
    const service = createAuthService(clientWith({ signInWithPassword }));
    await expect(service.signIn(" LEARNER@EXAMPLE.COM ", "Password123")).resolves.toEqual({ ok: true });
    expect(signInWithPassword).toHaveBeenCalledWith({ email: "learner@example.com", password: "Password123" });
  });
  it("returns generic failures and never throws provider wording to the UI", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ data: {}, error: new Error("Invalid login credentials for named account") });
    const result = await createAuthService(clientWith({ signInWithPassword })).signIn("learner@example.com", "WrongPass1");
    expect(result).toEqual({ ok: false, message: "authentication-failed" });
    expect(JSON.stringify(result)).not.toContain("named account");
  });
  it("uses generic success for password reset to avoid account enumeration", async () => {
    const resetPasswordForEmail = vi.fn().mockRejectedValue(new Error("No user"));
    const result = await createAuthService(clientWith({ resetPasswordForEmail })).requestPasswordReset("unknown@example.com");
    expect(result).toEqual({ ok: true });
  });
  it("exchanges callback codes without reflecting them in results", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ data: {}, error: new Error("expired") });
    const result = await createAuthService(clientWith({ exchangeCodeForSession })).exchangeCallback("private-callback-value");
    expect(result).toEqual({ ok: false, message: "invalid-or-expired-link" });
    expect(JSON.stringify(result)).not.toContain("private-callback-value");
  });
});
