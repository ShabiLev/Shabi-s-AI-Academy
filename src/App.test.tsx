import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { LanguageProvider } from "./i18n/LanguageContext";

function renderApp(path = "/dashboard") {
  window.history.replaceState({}, "", path);
  return render(
    <LanguageProvider>
      <App />
    </LanguageProvider>,
  );
}

function renderHashApp(path: string) {
  window.history.replaceState({}, "", "/");
  window.location.hash = path;
  return render(
    <LanguageProvider>
      <App routerMode="hash" />
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

  it("renders the public landing page for unauthenticated visitors", () => {
    renderApp("/");
    expect(screen.getByRole("heading", { name: "לומדים AI דרך עשייה מודרכת" })).toBeInTheDocument();
  });

  it("redirects unauthenticated visitors from protected routes", () => {
    renderApp("/lessons");
    expect(screen.getByRole("heading", { name: "כניסה" })).toBeInTheDocument();
  });

  it("keeps BrowserRouter as the default router", async () => {
    renderApp("/about");
    expect(window.location.hash).toBe("");
    expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("supports direct public routes with HashRouter", async () => {
    renderHashApp("/about");
    expect(window.location.hash).toBe("#/about");
    expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("protects direct Dashboard routes with HashRouter", () => {
    renderHashApp("/dashboard");
    expect(screen.getByRole("heading", { name: "כניסה" })).toBeInTheDocument();
    expect(window.location.hash).toContain("#/login?from=%2Fdashboard");
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
      await screen.findByRole("heading", { name: "ברוך שובך, שבי" }),
    ).toBeInTheDocument();
  });

  it("uses the correct Hebrew name in the welcome text", async () => {
    const user = userEvent.setup();
    renderApp();
    await demoLogin(user);
    expect(
      await screen.findByRole("heading", { name: "ברוך שובך, שבי" }),
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
      await screen.findByRole("heading", { name: "ברוך שובך, שבי" }),
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
    await waitFor(() => expect(screen.getAllByRole("menuitem")[0]).toHaveFocus());
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await waitFor(() => expect(document.querySelector(".profile-trigger")).toHaveFocus());
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

  it("supports arrow-key navigation within the profile menu", async () => {
    const user = userEvent.setup();
    renderApp();
    await demoLogin(user);
    await user.click(document.querySelector(".profile-trigger") as HTMLButtonElement);
    await waitFor(() => expect(screen.getAllByRole("menuitem")[0]).toHaveFocus());
    await user.keyboard("{End}");
    expect(screen.getAllByRole("menuitem").at(-1)).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getAllByRole("menuitem")[0]).toHaveFocus();
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

  it("runs an agent and links it to a selected local project", async () => {
    const user = userEvent.setup();
    localStorage.setItem("shabis-ai-academy-language", "en");
    localStorage.setItem("shabis-ai-academy.projects.v1", JSON.stringify({ schemaVersion: 1, projects: [{
      id: "project-component", name: "Component Review", description: "", category: "qa", status: "active", tags: [],
      promptIds: [], agentIds: [], runIds: [], documentIds: [], notes: "", activity: [], createdAt: "2026-07-13T00:00:00.000Z",
      updatedAt: "2026-07-13T00:00:00.000Z", version: 1, favorite: false, archived: false,
    }] }));
    renderApp("/playground/agents");
    await user.click(screen.getByRole("button", { name: "Demo Login" }));
    expect(await screen.findByRole("heading", { name: "Agent Playground" })).toBeInTheDocument();
    const agentSelect = screen.getByLabelText("Select agent") as HTMLSelectElement;
    await user.selectOptions(agentSelect, agentSelect.options[1]);
    await user.click(screen.getByRole("button", { name: "Import agent" }));
    await user.clear(screen.getByLabelText("Sample input"));
    await user.type(screen.getByLabelText("Sample input"), "Review this beta run");
    await user.selectOptions(screen.getByLabelText("Mode"), "dryRun");
    await user.click(screen.getByRole("button", { name: "Run" }));
    expect(await screen.findByText(/Review this beta run/, { selector: "pre" })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Mode"), "mock");
    await user.selectOptions(screen.getByLabelText("Scenario"), "retryThenSuccess");
    await user.selectOptions(screen.getByLabelText("Select project"), "project-component");
    await user.click(screen.getByRole("button", { name: "Run" }));
    expect(await screen.findByText("completed", { exact: true })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save to project" }));
    expect(screen.getByRole("status")).toHaveTextContent("Agent and run saved");
    const project = JSON.parse(localStorage.getItem("shabis-ai-academy.projects.v1")!).projects[0];
    expect(project.agentIds).toHaveLength(1);
    expect(project.runIds).toHaveLength(1);
  });
});
