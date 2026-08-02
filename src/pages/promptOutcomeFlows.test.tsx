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

describe("Version 2.0 Prompt Outcome experience", () => {
  beforeEach(() => resetAppStorageWithCompletedWalkthrough());

  it("creates a completed Prompt Result outcome when a new prompt is saved for the first time", async () => {
    const user = userEvent.setup();
    let view = renderApp("/prompts/new");

    await user.type(
      await screen.findByLabelText("שם הפרומפט"),
      "בדיקת תוצאה לפרומפט",
    );
    await user.type(
      screen.getByLabelText("משימה"),
      "כתיבת פרומפט לבדיקת תהליך התוצאה.",
    );
    await user.click(screen.getByRole("button", { name: "שמירה" }));

    // Submitting navigates straight to the new prompt's details page.
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "בדיקת תוצאה לפרומפט",
      }),
    ).toBeVisible();

    // Unmount, then mount a fresh tree at "/outcomes" to confirm the linked Outcome
    // was persisted (not just held in in-memory state) and renders from storage alone.
    view.unmount();
    view = renderApp("/outcomes");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "תוצאות עבודה",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: "בדיקת תוצאה לפרומפט" }),
    ).toBeVisible();
    expect(screen.getByText("מקומי")).toBeInTheDocument();
  });
});
