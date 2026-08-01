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

describe("Version 1.9 evaluation page flows", () => {
  beforeEach(() => resetAppStorageWithCompletedWalkthrough());

  it("creates, runs, inspects, and traces a deterministic evaluation", async () => {
    const user = userEvent.setup();
    renderApp("/evaluations/new");
    await user.type(await screen.findByLabelText("שם תיאורי"), "ניסוי כיסוי מלא");
    await user.click(screen.getByRole("button", { name: "יצירת טיוטת ניסוי" }));
    expect(await screen.findByRole("heading", { name: "ניסוי כיסוי מלא" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "התחלת הרצה" }));
    expect(await screen.findByRole("button", { name: "השלמת הערכה דטרמיניסטית" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "השלמת הערכה דטרמיניסטית" }));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");

    await user.click(screen.getByRole("link", { name: "תוצאות" }));
    expect(await screen.findByTestId("evaluation-results")).toBeVisible();
    expect(screen.getByRole("heading", { name: "ניסוי כיסוי מלא" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "חוקר הראיות" })).toBeVisible();
    expect(screen.getAllByRole("row").length).toBeGreaterThan(2);

    await user.click(screen.getByRole("link", { name: "עקבות וראיות" }));
    expect(
      await screen.findByTestId("evaluation-trace", undefined, {
        timeout: 10_000,
      }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "עקבות הרצה בטוחים" })).toBeVisible();
    await user.selectOptions(screen.getByLabelText("סינון לפי שלב"), "evaluate");
    expect(screen.getByText(/אירועים מוצגים/)).toBeInTheDocument();
  }, 15_000);

  it("shows recoverable empty and validation states without fabricating results", async () => {
    const user = userEvent.setup();
    renderApp("/evaluations/missing/results");
    expect(await screen.findByRole("heading", { name: "עדיין אין תוצאה שמורה" })).toBeVisible();

    window.history.pushState({}, "", "/evaluations/new");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(await screen.findByRole("heading", { name: "בניית ניסוי הערכה" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "יצירת טיוטת ניסוי" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveFocus());
    expect(screen.getByRole("alert")).toHaveTextContent("ההגדרה עדיין אינה תקינה");
  });
});
