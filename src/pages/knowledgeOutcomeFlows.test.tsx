import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../App";
import { LanguageProvider } from "../i18n/LanguageContext";
import { resetAppStorageWithCompletedWalkthrough } from "../test/walkthroughFixture";

function renderApp(path: string) {
  window.history.replaceState({}, "", path);
  return render(<LanguageProvider><App /></LanguageProvider>);
}

describe("Version 2.0 Outcome experience — Knowledge", () => {
  beforeEach(() => resetAppStorageWithCompletedWalkthrough());

  it("creates a Context Result Outcome when a new knowledge document is saved", async () => {
    const user = userEvent.setup();
    const view = renderApp("/knowledge/new");

    await user.type(await screen.findByLabelText("Title"), "Release checklist");
    await user.type(screen.getByLabelText("Content"), "Verify the checklist before shipping.");
    await user.click(screen.getByRole("button", { name: "שמירה" }));

    expect(await screen.findByRole("heading", { name: "Release checklist" })).toBeVisible();

    view.unmount();
    renderApp("/outcomes");
    expect(await screen.findByRole("heading", { level: 2, name: "Release checklist" })).toBeVisible();
    expect(screen.getByText("מקומי")).toBeInTheDocument();
  });
});
