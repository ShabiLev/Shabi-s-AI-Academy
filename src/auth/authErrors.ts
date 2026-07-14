export function safeAuthError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string" && /network|fetch|offline/i.test(error.message)) return "network-unavailable";
  return "authentication-failed";
}
