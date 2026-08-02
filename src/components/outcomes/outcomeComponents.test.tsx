import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EvidenceStatus, LimitationsPanel, NextActions, RealityBadge, ResultActions, ResultSummary } from ".";

const localized = (he: string, en: string) => ({ he, en });

describe("shared outcome components", () => {
  it("renders every honest reality mode bilingually without relying on color alone", () => {
    const { rerender } = render(<RealityBadge language="en" mode="blueprint" />);
    expect(screen.getByText("Blueprint only")).toHaveAttribute("data-reality", "blueprint");
    rerender(<RealityBadge language="he" mode="notConnected" />);
    expect(screen.getByText("לא מחובר")).toHaveAttribute("data-reality", "notConnected");
  });

  it("labels and focuses a result summary while keeping references instead of entity copies", () => {
    render(<ResultSummary language="en" title={localized("תוצאה", "Saved prompt")} summary={localized("סיכום", "Ready to use locally")} location={localized("ספרייה", "Prompt library")} references={[{ id: "prompt-1", label: localized("פרומפט", "Prompt one"), href: "/prompts/prompt-1" }]} focusOnMount />);
    expect(screen.getByRole("heading", { level: 1, name: "Saved prompt" })).toHaveFocus();
    expect(screen.getByRole("region", { name: "Saved prompt" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Prompt one" })).toHaveAttribute("href", "/prompts/prompt-1");
  });

  it("announces result status changes through a polite atomic live region", () => {
    const { rerender } = render(<ResultSummary language="en" title={localized("תוצאה", "Result")} summary={localized("סיכום", "Summary")} statusMessage={localized("נשמר", "Saved")} />);
    const liveRegion = screen.getByText("Saved");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toHaveAttribute("aria-atomic", "true");
    rerender(<ResultSummary language="he" title={localized("תוצאה", "Result")} summary={localized("סיכום", "Summary")} statusMessage={localized("עודכן", "Updated")} />);
    expect(screen.getByText("עודכן")).toBeInTheDocument();
  });

  it("supports native keyboard actions and accessible descriptions", async () => {
    const onSelect = vi.fn();
    render(<ResultActions language="en" actions={[{ id: "copy", label: localized("העתקה", "Copy"), description: localized("העתקת התוצאה", "Copy the result"), onSelect }, { id: "project", label: localized("לפרויקט", "Add to project"), href: "/projects/one" }]} />);
    const button = screen.getByRole("button", { name: "Copy" });
    button.focus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
    expect(button).toHaveAccessibleDescription("Copy the result");
    expect(screen.getByRole("link", { name: "Add to project" })).toHaveAttribute("href", "/projects/one");
  });

  it("never presents verified status without an evidence reference", () => {
    const { rerender } = render(<EvidenceStatus language="en" state="verified" />);
    expect(screen.getByText("Evidence required")).toBeVisible();
    rerender(<EvidenceStatus language="he" state="verified" evidence={[{ id: "evidence-1", label: localized("בדיקה שעברה", "Passing test") }]} />);
    expect(screen.getByText("אומת באמצעות ראיות")).toBeVisible();
    expect(screen.getByText("בדיקה שעברה")).toBeVisible();
  });

  it("renders limitations and ordered next actions with a textual recommendation", async () => {
    const onSelect = vi.fn();
    render(<><LimitationsPanel language="en" limitations={[localized("לא מחובר", "No provider is connected")]} /><NextActions language="en" recommendedId="review" actions={[{ id: "review", label: localized("סקירה", "Review evidence"), description: localized("לפני השלמה", "Before completion"), onSelect }]} /></>);
    expect(screen.getByRole("complementary", { name: "Important limitations" })).toHaveTextContent("No provider is connected");
    expect(screen.getByText("Recommended")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Review evidence" }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("omits empty optional action sections", () => {
    const { container } = render(<><ResultActions language="en" actions={[]} /><NextActions language="en" actions={[]} /><LimitationsPanel language="en" limitations={[]} /></>);
    expect(container).toBeEmptyDOMElement();
  });
});
