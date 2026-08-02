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

describe("Version 2.0 Team Outcome experience", () => {
  beforeEach(() => resetAppStorageWithCompletedWalkthrough());

  it("creates a completed Team Specification Outcome when a preset is copied to My Teams, shown as Blueprint only", async () => {
    const user = userEvent.setup();
    let view = renderApp("/team");

    const copyButtons = await screen.findAllByRole("button", { name: "העתקה לצוותים שלי" });
    await user.click(copyButtons[0]);

    // Direct route + refresh: unmount, then mount a fresh tree at the Outcomes list purely from
    // persisted storage (simulating a full page reload), matching the reference outcomeFlows pattern.
    view.unmount();
    view = renderApp("/outcomes");

    expect(await screen.findByRole("heading", { level: 1, name: "תוצאות עבודה" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: "מסירת יכולת" })).toBeVisible();
    expect(screen.getByText("תכנית בלבד")).toBeInTheDocument();
  });
});
