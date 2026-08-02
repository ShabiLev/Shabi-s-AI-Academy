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

describe("Version 2.0 Agent Blueprint Outcome experience", () => {
  beforeEach(() => resetAppStorageWithCompletedWalkthrough());

  it("creates a linked, completed Agent Blueprint Outcome when a new Agent is saved, and shows it on the Outcomes list", async () => {
    const user = userEvent.setup();
    const view = renderApp("/agents/new");
    const next = () => user.click(screen.getByRole("button", { name: "הבא" }));

    // Step 1: name.
    await user.type(await screen.findByLabelText("שם האייג׳נט"), "סוכן בדיקה");
    await next();
    // Step 2: goal.
    await user.type(screen.getByLabelText("מטרה"), "מטרת בדיקה עבור תכנית הסוכן");
    await next();
    // Step 3: inputs (not required).
    await next();
    // Step 4: instructions.
    await user.type(screen.getByLabelText("הנחיות"), "הנחיות בדיקה עבור הסוכן");
    await next();
    // Step 5: tools (not required).
    await next();
    // Step 6: memory (not required).
    await next();
    // Step 7: validation (not required).
    await next();
    // Step 8: retry policy (defaults are valid without a stop condition).
    await next();
    // Step 9: human approval (not required).
    await next();
    // Step 10: output format.
    await user.type(screen.getByLabelText("פלט"), "פורמט פלט בדיקה");
    await next();
    // Step 11: completion criteria and error handling (both required by validateAdvancedAgent).
    await user.type(screen.getByLabelText("תנאי סיום"), "תנאי סיום לבדיקה");
    await user.type(screen.getByLabelText("טיפול בשגיאות"), "טיפול בשגיאות לבדיקה");
    await next();

    // Step 12: review and save.
    await user.click(await screen.findByRole("button", { name: "שמירת אייג׳נט" }));

    view.unmount();
    renderApp("/outcomes");
    expect(await screen.findByRole("heading", { level: 1, name: "תוצאות עבודה" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: "סוכן בדיקה" })).toBeVisible();
    expect(screen.getByText("תכנית בלבד")).toBeInTheDocument();
  });
});
