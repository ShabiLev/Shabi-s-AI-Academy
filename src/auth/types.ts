export type AuthStatus = "loading" | "local-only" | "guest" | "authenticated" | "session-expired" | "auth-unavailable" | "network-unavailable" | "unauthenticated";
export interface AcademyUser {
  id: string; displayNameHe: string; displayNameEn: string; email: string; role: string; avatarInitials: string;
  accountType: "guest" | "cloud"; roleSource: "local" | "verified-claim";
}
export interface RegistrationInput { firstName: string; lastName: string; email: string; password: string; language: "he" | "en"; experienceLevel?: string; mainGoal?: string }
export interface AuthResult { ok: boolean; requiresEmailVerification?: boolean; message?: string }
export interface AuthContextValue {
  user: AcademyUser | null; status: AuthStatus; isAuthenticated: boolean; isCloudAuthenticated: boolean; isConfigured: boolean;
  demoLogin: () => void; continueAsGuest: () => void; signIn: (email: string, password: string) => Promise<AuthResult>;
  register: (input: RegistrationInput) => Promise<AuthResult>; sendMagicLink: (email: string) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>; updatePassword: (password: string) => Promise<AuthResult>;
  exchangeCallback: (code: string) => Promise<AuthResult>; signOut: (clearGuestSession?: boolean) => Promise<void>;
}
