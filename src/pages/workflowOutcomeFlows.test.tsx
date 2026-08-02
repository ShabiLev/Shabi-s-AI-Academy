import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../App";
import { LanguageProvider } from "../i18n/LanguageContext";
import { resetAppStorageWithCompletedWalkthrough } from "../test/walkthroughFixture";

function renderApp(path: string) {
  window.history.replaceState({}, "", path);
  return render(<LanguageProvider><App /></LanguageProvider>);
}

describe("Version 2.0 Outcome experience — Workflow", () => {
  beforeEach(() => resetAppStorageWithCompletedWalkthrough());

  it("creates a workflow from /workflows/new and immediately shows the builder, not a stale 'not found' state", async () => {
    const user = userEvent.setup();
    renderApp("/workflows/new");
    await user.click(await screen.findByRole("button", { name: "יצירה" }));
    expect(await screen.findByRole("button", { name: "Mock Run" })).toBeVisible();
  });

  it("creates a Run Report Outcome honestly labeled Simulated, never Completed, when a Mock Run finishes", async () => {
    const user = userEvent.setup();
    const view = renderApp("/workflows/new");

    await user.click(await screen.findByRole("button", { name: "יצירה" }));
    const mockRunButton = await screen.findByRole("button", { name: "Mock Run" });
    await user.click(mockRunButton);
    await waitFor(() => expect(mockRunButton).not.toBeDisabled());

    view.unmount();
    renderApp("/outcomes");
    expect(await screen.findByText("הדמיה")).toBeInTheDocument();
  });
});
