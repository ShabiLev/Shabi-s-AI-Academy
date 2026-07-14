import { describe, expect, it } from "vitest";
import { readAuthConfig, safeRequestedRoute } from "./authConfig";
import { normalizeEmail, passwordIssues, validEmail } from "./authValidation";

describe("optional auth configuration", () => {
  it("stays unconfigured unless both valid public values are present", () => {
    expect(readAuthConfig({})).toEqual({ configured: false, reason: "missing" });
    expect(readAuthConfig({ VITE_SUPABASE_URL: "https://example.supabase.co", VITE_SUPABASE_ANON_KEY: "short" }).reason).toBe("invalid");
    expect(readAuthConfig({ VITE_SUPABASE_URL: "https://example.supabase.co", VITE_SUPABASE_ANON_KEY: "public-anonymous-key-value" }).configured).toBe(true);
  });
  it("only restores bounded internal destinations", () => {
    expect(safeRequestedRoute("/lessons?next=1")).toBe("/lessons?next=1");
    expect(safeRequestedRoute("//attacker.example")).toBe("/");
    expect(safeRequestedRoute("/auth/callback?code=value")).toBe("/");
  });
});

describe("auth input validation", () => {
  it("normalizes email and rejects malformed addresses", () => { expect(normalizeEmail(" Learner@Example.COM ")).toBe("learner@example.com"); expect(validEmail("not-an-email")).toBe(false); });
  it("requires a long mixed password", () => { expect(passwordIssues("short")).toEqual(expect.arrayContaining(["length", "uppercase", "number"])); expect(passwordIssues("StrongPass1")).toEqual([]); });
});
