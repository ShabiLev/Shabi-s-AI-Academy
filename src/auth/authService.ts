import type { SupabaseClient, User } from "@supabase/supabase-js";
import { authRedirectUrl } from "./authConfig";
import { safeAuthError } from "./authErrors";
import { normalizeEmail } from "./authValidation";
import type { AcademyUser, AuthResult, RegistrationInput } from "./types";

export function mapSupabaseUser(user: User): AcademyUser {
  const first = typeof user.user_metadata?.first_name === "string" ? user.user_metadata.first_name : "";
  const last = typeof user.user_metadata?.last_name === "string" ? user.user_metadata.last_name : "";
  const display = `${first} ${last}`.trim() || user.email?.split("@")[0] || "Learner";
  const role = user.app_metadata?.role === "admin" ? "admin" : "AI Academy Learner";
  return { id: user.id, email: user.email ?? "", displayNameHe: display, displayNameEn: display, role, avatarInitials: display.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(), accountType: "cloud", roleSource: "verified-claim" };
}
export function createAuthService(client: SupabaseClient | null) {
  const unavailable = async (): Promise<AuthResult> => ({ ok: false, message: "auth-unavailable" });
  return {
    signIn: client ? async (email: string, password: string) => { try { const { error } = await client.auth.signInWithPassword({ email: normalizeEmail(email), password }); return error ? { ok: false, message: safeAuthError(error) } : { ok: true }; } catch (error) { return { ok: false, message: safeAuthError(error) }; } } : unavailable,
    register: client ? async (input: RegistrationInput) => { try { const { data, error } = await client.auth.signUp({ email: normalizeEmail(input.email), password: input.password, options: { emailRedirectTo: authRedirectUrl(), data: { first_name: input.firstName.trim().slice(0, 80), last_name: input.lastName.trim().slice(0, 80), preferred_language: input.language, experience_level: input.experienceLevel, main_goal: input.mainGoal } } }); return error ? { ok: false, message: safeAuthError(error) } : { ok: true, requiresEmailVerification: !data.session }; } catch (error) { return { ok: false, message: safeAuthError(error) }; } } : unavailable,
    sendMagicLink: client ? async (email: string) => { try { const { error } = await client.auth.signInWithOtp({ email: normalizeEmail(email), options: { emailRedirectTo: authRedirectUrl(), shouldCreateUser: false } }); return error ? { ok: false, message: safeAuthError(error) } : { ok: true }; } catch (error) { return { ok: false, message: safeAuthError(error) }; } } : unavailable,
    requestPasswordReset: client ? async (email: string) => { try { await client.auth.resetPasswordForEmail(normalizeEmail(email), { redirectTo: authRedirectUrl("recovery") }); return { ok: true }; } catch { return { ok: true }; } } : unavailable,
    updatePassword: client ? async (password: string) => { try { const { error } = await client.auth.updateUser({ password }); return error ? { ok: false, message: safeAuthError(error) } : { ok: true }; } catch (error) { return { ok: false, message: safeAuthError(error) }; } } : unavailable,
    exchangeCallback: client ? async (code: string) => { try { const { error } = await client.auth.exchangeCodeForSession(code); return error ? { ok: false, message: "invalid-or-expired-link" } : { ok: true }; } catch { return { ok: false, message: "invalid-or-expired-link" }; } } : unavailable,
  };
}
