/* eslint-disable react-refresh/only-export-components -- Provider and hook belong together. */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getAuthClient } from "./authClient";
import { readAuthConfig } from "./authConfig";
import { createAuthService, mapSupabaseUser } from "./authService";
import type { AcademyUser, AuthContextValue, AuthResult, AuthStatus, RegistrationInput } from "./types";

const GUEST_KEY = "shabis-ai-academy-guest-session";
export const demoUser: AcademyUser = { id: "guest-user", displayNameHe: "שבי", displayNameEn: "Shabi", email: "", role: "AI Academy Learner", avatarInitials: "SA", accountType: "guest", roleSource: "local" };
function hasGuestSession() { try { return sessionStorage.getItem(GUEST_KEY) === "active" || sessionStorage.getItem("shabis-ai-academy-demo-session") === "active"; } catch { return false; } }
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = readAuthConfig().configured;
  const [user, setUser] = useState<AcademyUser | null>(() => hasGuestSession() ? demoUser : null);
  const [status, setStatus] = useState<AuthStatus>(() => hasGuestSession() ? "guest" : configured ? "loading" : "local-only");
  const client = useMemo(() => getAuthClient(), []);
  const service = useMemo(() => createAuthService(client), [client]);

  useEffect(() => {
    if (!client) return;
    let active = true;
    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) { setStatus(/network|fetch/i.test(error.message) ? "network-unavailable" : "session-expired"); return; }
      if (data.session?.user) { setUser(mapSupabaseUser(data.session.user)); setStatus("authenticated"); }
      else if (hasGuestSession()) { setUser(demoUser); setStatus("guest"); }
      else { setUser(null); setStatus("unauthenticated"); }
    }).catch(() => { if (active) setStatus("network-unavailable"); });
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (session?.user) { setUser(mapSupabaseUser(session.user)); setStatus("authenticated"); return; }
      if (event === "SIGNED_OUT" && !hasGuestSession()) { setUser(null); setStatus("unauthenticated"); }
      if (event === "TOKEN_REFRESHED" && !session) { setUser(null); setStatus("session-expired"); }
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [client]);

  const continueAsGuest = useCallback(() => { try { sessionStorage.setItem(GUEST_KEY, "active"); sessionStorage.setItem("shabis-ai-academy-demo-session", "active"); } catch { /* In-memory guest still works. */ } setUser(demoUser); setStatus("guest"); }, []);
  const withStatus = useCallback(async (operation: () => Promise<AuthResult>) => { setStatus("loading"); const result = await operation(); if (!result.ok) setStatus(result.message === "network-unavailable" ? "network-unavailable" : configured ? "unauthenticated" : "auth-unavailable"); return result; }, [configured]);
  const value = useMemo<AuthContextValue>(() => ({
    user, status, isAuthenticated: Boolean(user), isCloudAuthenticated: user?.accountType === "cloud", isConfigured: configured,
    demoLogin: continueAsGuest, continueAsGuest,
    signIn: (email, password) => withStatus(() => service.signIn(email, password)),
    register: (input: RegistrationInput) => withStatus(() => service.register(input)),
    sendMagicLink: (email) => withStatus(() => service.sendMagicLink(email)),
    requestPasswordReset: (email) => withStatus(() => service.requestPasswordReset(email)),
    updatePassword: (password) => withStatus(() => service.updatePassword(password)),
    exchangeCallback: (code) => withStatus(() => service.exchangeCallback(code)),
    signOut: async (clearGuestSession = true) => { if (client && user?.accountType === "cloud") await client.auth.signOut(); if (clearGuestSession) { try { sessionStorage.removeItem(GUEST_KEY); sessionStorage.removeItem("shabis-ai-academy-demo-session"); } catch { /* Continue in memory. */ } } setUser(null); setStatus(configured ? "unauthenticated" : "local-only"); },
  }), [client, configured, continueAsGuest, service, status, user, withStatus]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used within AuthProvider"); return context; }
