import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { unsubscribe, onAuthStateChange, getSession } = vi.hoisted(() => {
  const unsubscribe = vi.fn();
  return { unsubscribe, onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe } } })), getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) };
});
vi.mock("./authClient", () => ({ getAuthClient: () => ({ auth: { getSession, onAuthStateChange, signOut: vi.fn() } }) }));
vi.mock("./authConfig", async (importOriginal) => ({ ...(await importOriginal<typeof import("./authConfig")>()), readAuthConfig: () => ({ configured: true, config: { url: "https://example.supabase.co", anonKey: "public-anonymous-key-value" } }) }));

import { AuthProvider, useAuth } from "./AuthContext";
function Probe() { const { status } = useAuth(); return <span>{status}</span>; }

describe("AuthProvider session lifecycle", () => {
  it("restores once, subscribes once, and cleans up the centralized listener", async () => {
    const view = render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByText("unauthenticated")).toBeInTheDocument());
    expect(getSession).toHaveBeenCalledTimes(1);
    expect(onAuthStateChange).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
