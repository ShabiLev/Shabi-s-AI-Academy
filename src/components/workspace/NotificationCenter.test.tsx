import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationCenter } from "./NotificationCenter";

const workspace = vi.hoisted(() => ({
  state: { notifications: [{ id: "n1", type: "information", title: { he: "עדכון", en: "Update" }, message: { he: "הודעה", en: "Message" }, createdAt: "2026-07-22T00:00:00Z", read: false }] },
  unreadCount: 1, markRead: vi.fn(), markAllRead: vi.fn(), deleteNotification: vi.fn(), reset: vi.fn(),
}));
vi.mock("../../i18n/LanguageContext", () => ({ useLanguage: () => ({ language: "en" }) }));
vi.mock("../../workspace", () => ({ useWorkspace: () => workspace }));

describe("NotificationCenter", () => {
  beforeEach(() => vi.clearAllMocks());
  it("closes explicitly and restores focus", async () => {
    render(<MemoryRouter><NotificationCenter /></MemoryRouter>);
    const trigger = screen.getByRole("button", { name: /Notifications/ });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("button", { name: "Close notifications" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("closes with Escape and outside pointer interaction", async () => {
    render(<MemoryRouter><NotificationCenter /></MemoryRouter>);
    const trigger = screen.getByRole("button", { name: /Notifications/ });
    await userEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
