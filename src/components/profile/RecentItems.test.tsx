import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { RecentItems } from "./RecentItems";

const reset = vi.fn();
vi.mock("../../i18n/LanguageContext", () => ({ useLanguage: () => ({ language: "en" }) }));
vi.mock("../../workspace", () => ({ useWorkspace: () => ({ state: { activities: [{ id: "1", entityId: "lesson-1", entityType: "lesson", kind: "opened", title: "Lesson one", route: "/lessons/one", timestamp: "2026-07-22T08:00:00Z" }] }, reset }) }));

describe("RecentItems", () => {
  it("links to recent work and confirms destructive clearing", async () => {
    render(<MemoryRouter><RecentItems /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "Lesson one" })).toHaveAttribute("href", "/lessons/one");
    await userEvent.click(screen.getByRole("button", { name: "Clear history" }));
    expect(reset).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Delete all" }));
    expect(reset).toHaveBeenCalledWith("activity");
  });
});
