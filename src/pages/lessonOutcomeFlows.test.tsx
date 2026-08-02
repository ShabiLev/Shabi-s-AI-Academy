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

describe("Version 2.0 Outcome experience — Lesson", () => {
  beforeEach(() => resetAppStorageWithCompletedWalkthrough());

  it("rejects marking a lesson complete before the quiz is submitted, and only creates a Learning Result outcome once real evidence exists", async () => {
    const user = userEvent.setup();
    const view = renderApp("/lessons/language-model-basics");

    const markComplete = await screen.findByRole("button", { name: "סימון השיעור כהושלם" });
    await user.click(markComplete);
    expect(await screen.findByRole("alert")).toHaveTextContent("יש להשלים את השאלון שלמעלה לפני סימון השיעור כהושלם.");
    expect(screen.queryByText("השיעור הושלם")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "אימות מול קריטריונים ומקורות" }));
    await user.click(screen.getByRole("button", { name: "בדיקת תשובות" }));
    await screen.findByText("ניסיון נוסף");

    await user.click(screen.getByRole("button", { name: "סימון השיעור כהושלם" }));
    expect(await screen.findByText("השיעור הושלם")).toBeVisible();

    view.unmount();
    renderApp("/outcomes");
    expect(await screen.findByRole("heading", { level: 2, name: "יסודות מודלי שפה" })).toBeVisible();
    expect(screen.getByText("מקומי")).toBeInTheDocument();
  });
});
