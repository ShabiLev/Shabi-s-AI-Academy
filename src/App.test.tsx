import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { LanguageProvider } from "./i18n/LanguageContext";

function renderApp(path = "/") {
  window.history.replaceState({}, "", path);
  return render(
    <LanguageProvider>
      <App />
    </LanguageProvider>,
  );
}

async function demoLogin(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "כניסה למצב הדגמה" }));
}

describe("Shabi's AI Academy", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("renders Login for unauthenticated visitors", () => {
    renderApp();
    expect(screen.getByRole("heading", { name: "כניסה" })).toBeInTheDocument();
  });

  it("redirects unauthenticated visitors from protected routes", () => {
    renderApp("/lessons");
    expect(screen.getByRole("heading", { name: "כניסה" })).toBeInTheDocument();
  });

  it("Demo Login grants access and preserves the requested route", async () => {
    const user = userEvent.setup();
    renderApp("/lessons");
    await demoLogin(user);
    expect(
      screen.getByRole("heading", { level: 1, name: "שיעורים" }),
    ).toBeInTheDocument();
  });

  it("redirects authenticated visitors away from Login", async () => {
    const user = userEvent.setup();
    const first = renderApp("/login");
    await demoLogin(user);
    first.unmount();
    renderApp("/login");
    expect(
      screen.getByRole("heading", { name: "ברוך שובך, שבי" }),
    ).toBeInTheDocument();
  });

  it("uses the correct Hebrew name in the welcome text", async () => {
    const user = userEvent.setup();
    renderApp();
    await demoLogin(user);
    expect(
      screen.getByRole("heading", { name: "ברוך שובך, שבי" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/שאבי/)).not.toBeInTheDocument();
  });

  it("does not render a language switcher in the global header", async () => {
    const user = userEvent.setup();
    renderApp();
    await demoLogin(user);
    expect(
      screen.queryByRole("group", { name: "בחירת שפה" }),
    ).not.toBeInTheDocument();
  });

  it("changes language and direction from Settings", async () => {
    const user = userEvent.setup();
    renderApp("/settings");
    await demoLogin(user);
    await user.click(screen.getByRole("radio", { name: /English/ }));
    await waitFor(() =>
      expect(document.documentElement).toHaveAttribute("lang", "en"),
    );
    expect(document.documentElement).toHaveAttribute("dir", "ltr");
    expect(
      screen.getByRole("heading", { name: "Settings" }),
    ).toBeInTheDocument();
  });

  it("persists the Settings language selection after remount", async () => {
    const user = userEvent.setup();
    const first = renderApp("/settings");
    await demoLogin(user);
    await user.click(screen.getByRole("radio", { name: /English/ }));
    first.unmount();
    renderApp("/settings");
    expect(screen.getByRole("radio", { name: /English/ })).toBeChecked();
  });

  it("shows the active-language user name in the profile menu", async () => {
    const user = userEvent.setup();
    renderApp("/settings");
    await demoLogin(user);
    await user.click(screen.getByRole("radio", { name: /English/ }));
    await user.click(screen.getByRole("button", { name: "Open profile menu" }));
    expect(screen.getAllByText("Shabi").length).toBeGreaterThan(0);
  });

  it("signs out and returns to Login", async () => {
    const user = userEvent.setup();
    renderApp();
    await demoLogin(user);
    await user.click(
      screen.getByRole("button", { name: "פתיחת תפריט הפרופיל" }),
    );
    await user.click(screen.getByRole("menuitem", { name: "התנתקות" }));
    expect(screen.getByRole("heading", { name: "כניסה" })).toBeInTheDocument();
  });

  it("shows Home and Back controls on Lessons", async () => {
    const user = userEvent.setup();
    renderApp("/lessons");
    await demoLogin(user);
    expect(screen.getByRole("button", { name: "בית" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "חזרה" })).toBeInTheDocument();
  });

  it("Home returns to Dashboard", async () => {
    const user = userEvent.setup();
    renderApp("/lessons");
    await demoLogin(user);
    await user.click(screen.getByRole("button", { name: "בית" }));
    expect(
      screen.getByRole("heading", { name: "ברוך שובך, שבי" }),
    ).toBeInTheDocument();
  });

  it("does not show redundant Home or Back controls on Dashboard", async () => {
    const user = userEvent.setup();
    renderApp();
    await demoLogin(user);
    expect(
      screen.queryByRole("button", { name: "בית" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "חזרה" }),
    ).not.toBeInTheDocument();
  });

  it("closes the profile menu with Escape", async () => {
    const user = userEvent.setup();
    renderApp();
    await demoLogin(user);
    await user.click(
      screen.getByRole("button", { name: "פתיחת תפריט הפרופיל" }),
    );
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes the profile menu when clicking outside", async () => {
    const user = userEvent.setup();
    renderApp();
    await demoLogin(user);
    await user.click(
      screen.getByRole("button", { name: "פתיחת תפריט הפרופיל" }),
    );
    await user.click(screen.getByRole("main"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens the drawer and closes it with Escape", async () => {
    const user = userEvent.setup();
    renderApp();
    await demoLogin(user);
    await user.click(
      screen.getByRole("button", { name: "פתיחת תפריט הניווט" }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
