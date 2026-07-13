import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssistantSidebar } from "./AssistantSidebar";

const assistant = vi.hoisted(() => ({
  mode: "collapsed" as "collapsed" | "compact" | "expanded",
  setMode: vi.fn(),
  history: [{ id: "1", text: "Local recent activity" }],
}));

vi.mock("../../assistant", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../assistant")>();
  return { ...actual, useAssistant: () => assistant };
});
vi.mock("../../i18n/LanguageContext", () => ({ useLanguage: () => ({ language: "en" }) }));

describe("AssistantSidebar", () => {
  beforeEach(() => { assistant.mode = "collapsed"; assistant.setMode.mockClear(); });

  it("opens from the collapsed launcher", async () => {
    render(<MemoryRouter><AssistantSidebar /></MemoryRouter>);
    await userEvent.click(screen.getByRole("button", { name: "Expand Assistant" }));
    expect(assistant.setMode).toHaveBeenCalledWith("compact");
  });

  it("expands, collapses, and closes on Escape or browser Back", async () => {
    assistant.mode = "compact";
    const view = render(<MemoryRouter><AssistantSidebar /></MemoryRouter>);
    await userEvent.click(screen.getByRole("button", { name: "Expand Assistant" }));
    await userEvent.click(screen.getByRole("button", { name: "Collapse Assistant" }));
    assistant.mode = "expanded";
    view.rerender(<MemoryRouter><AssistantSidebar /></MemoryRouter>);
    expect(screen.getByText("Local recent activity")).toBeVisible();
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.popState(window);
    expect(assistant.setMode).toHaveBeenCalledWith("collapsed");
  });
});
