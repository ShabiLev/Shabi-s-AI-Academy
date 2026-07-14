export interface AuthConfig { url: string; anonKey: string }
export interface AuthConfigState { configured: boolean; config?: AuthConfig; reason?: "missing" | "invalid" }
function isSafeUrl(value: string) { try { const url = new URL(value); return url.protocol === "https:" || (url.protocol === "http:" && url.hostname === "127.0.0.1"); } catch { return false; } }
export function readAuthConfig(env: Record<string, string | undefined> = import.meta.env): AuthConfigState {
  const url = env.VITE_SUPABASE_URL?.trim(); const anonKey = env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return { configured: false, reason: "missing" };
  if (!isSafeUrl(url) || anonKey.length < 20) return { configured: false, reason: "invalid" };
  return { configured: true, config: { url, anonKey } };
}
export function safeRequestedRoute(value: string | null | undefined, fallback = "/") { return value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") && !value.startsWith("/auth/") && value.length <= 500 ? value : fallback; }
export function authRedirectUrl(kind: "callback" | "recovery" = "callback") {
  const base = new URL(import.meta.env.BASE_URL || "/", window.location.origin);
  base.searchParams.set("auth-flow", kind);
  base.hash = "/auth/callback";
  return base.toString();
}
