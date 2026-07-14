import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  register: vi.fn(),
  exchangeCallback: vi.fn(),
}));

vi.mock("../../auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../auth")>()),
  useAuth: () => ({
    isConfigured: true,
    status: "unauthenticated",
    register: auth.register,
    exchangeCallback: auth.exchangeCallback,
  }),
}));

vi.mock("../../i18n/LanguageContext", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../i18n/LanguageContext")>()),
  useLanguage: () => ({ language: "en" }),
}));

import { AuthCallbackPage } from "./AuthCallbackPage";
import { AuthRegisterPage } from "./AuthRegisterPage";

function Destination() {
  const location = useLocation();
  return <output>{`${location.pathname}${location.search}`}</output>;
}

describe("account registration and callback flows", () => {
  beforeEach(() => {
    auth.register.mockReset();
    auth.exchangeCallback.mockReset();
  });

  it("validates registration before submitting and routes verification safely", async () => {
    const user = userEvent.setup();
    auth.register.mockResolvedValue({ ok: true, requiresEmailVerification: true });
    render(
      <MemoryRouter initialEntries={["/auth/register"]}>
        <Routes>
          <Route path="/auth/register" element={<AuthRegisterPage />} />
          <Route path="/auth/verify-email" element={<Destination />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Create account" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Complete all fields");
    expect(auth.register).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("First name"), "Test");
    await user.type(screen.getByLabelText("Last name"), "Learner");
    await user.type(screen.getByLabelText("Email"), "learner@example.test");
    await user.type(screen.getByLabelText("Password"), "ValidPass123");
    await user.type(screen.getByLabelText("Confirm password"), "ValidPass123");
    await user.selectOptions(screen.getByLabelText("Experience level (optional)"), "beginner");
    await user.type(screen.getByLabelText("Main goal (optional)"), "Learn safe AI workflows");
    await user.click(screen.getByLabelText(/I agree to the/));
    await user.click(screen.getByLabelText("I acknowledge the Privacy Notice"));
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => expect(auth.register).toHaveBeenCalledOnce());
    expect(auth.register).toHaveBeenCalledWith(expect.objectContaining({
      firstName: "Test",
      email: "learner@example.test",
      terms: true,
      privacy: true,
    }));
    expect(screen.getByText("/auth/verify-email?email=learner%40example.test")).toBeInTheDocument();
  });

  it("exchanges a recovery callback once and clears the saved destination", async () => {
    window.history.pushState({}, "", "/auth/callback?code=fixture-code&auth-flow=recovery");
    sessionStorage.setItem("shabis-ai-academy-auth-destination", "/projects");
    auth.exchangeCallback.mockResolvedValue({ ok: true });
    render(
      <MemoryRouter initialEntries={[window.location.pathname + window.location.search]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/auth/reset-password" element={<Destination />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(auth.exchangeCallback).toHaveBeenCalledWith("fixture-code"));
    expect(auth.exchangeCallback).toHaveBeenCalledOnce();
    expect(await screen.findByText("/auth/reset-password")).toBeInTheDocument();
    expect(sessionStorage.getItem("shabis-ai-academy-auth-destination")).toBeNull();
  });

  it("handles an invalid callback without exchanging data and returns to sign in", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/auth/callback?error=expired");
    render(
      <MemoryRouter initialEntries={[window.location.pathname + window.location.search]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/auth/login" element={<Destination />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "The link is not valid" })).toBeInTheDocument();
    expect(auth.exchangeCallback).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Back to sign in" }));
    expect(screen.getByText("/auth/login")).toBeInTheDocument();
  });
});
