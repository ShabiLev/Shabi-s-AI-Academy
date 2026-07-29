import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../App";
import { LanguageProvider } from "../i18n/LanguageContext";
import { resetAppStorageWithCompletedWalkthrough } from "../test/walkthroughFixture";

function renderApp(path: string) {
  window.history.replaceState({}, "", path);
  return render(<LanguageProvider><App /></LanguageProvider>);
}

describe("Version 1.8 mission experience", () => {
  beforeEach(() => {
    resetAppStorageWithCompletedWalkthrough();
    localStorage.setItem("shabis-ai-academy-language", "en");
  });

  it("builds, reviews, runs, pauses, and inspects a local mission", async () => {
    const user = userEvent.setup();
    const empty = renderApp("/missions");
    expect(await screen.findByRole("heading", { name: "No missions yet" })).toBeInTheDocument();
    empty.unmount();

    renderApp("/missions/new");
    const goal = await screen.findByLabelText("Mission description");
    await user.type(goal, "Deliver an accessible mission workspace with regression evidence");
    expect(screen.getByText("What the system understood")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Create mission for review" }));

    expect(await screen.findByTestId("mission-workspace")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Approve plan" }));
    await user.click(screen.getByRole("button", { name: "Start" }));
    await user.type(screen.getByLabelText("Name"), "Release context");
    await user.type(screen.getByLabelText("Note"), "Local regression constraints");
    await user.click(screen.getByRole("button", { name: "Save pack" }));
    expect(screen.getByRole("status")).toHaveTextContent("Context Pack saved");
    await user.click(screen.getByRole("button", { name: "Show team" }));
    expect(screen.getByRole("button", { name: "Hide team" })).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Pause" }));
    await user.click(screen.getByRole("button", { name: "Safe continue" }));
    await user.click(screen.getByRole("button", { name: "Mark needs work" }));
    await user.click(screen.getByRole("button", { name: "Retry" }));

    await user.click(screen.getByRole("link", { name: "Plan" }));
    expect(await screen.findByRole("heading", { name: "Mission Plan" })).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Back to workspace" }));
    await user.click(screen.getByRole("link", { name: "Evidence" }));
    expect(await screen.findByRole("heading", { name: "Mission Evidence" })).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Back to workspace" }));
    await user.click(screen.getByRole("link", { name: "Team" }));
    expect(await screen.findByTestId("team-page")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mission team controls" })).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Copy to My Teams" })[0]);
    expect(screen.getByRole("heading", { name: "My Teams" })).toBeInTheDocument();
  }, 15_000);
});
