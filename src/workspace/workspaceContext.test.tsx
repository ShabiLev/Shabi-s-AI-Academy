import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { WorkspaceProvider, useWorkspace } from "./WorkspaceContext";

function Harness() {
  const workspace = useWorkspace();
  const first = workspace.state.notifications[0];
  return <div>
    <output data-testid="activity">{workspace.state.activities.length}</output>
    <output data-testid="preferences">{workspace.state.preferences.length}</output>
    <output data-testid="notifications">{workspace.state.notifications.length}</output>
    <output data-testid="unread">{workspace.unreadCount}</output>
    <output data-testid="analytics">{workspace.state.analytics.length}</output>
    <button onClick={() => workspace.recordActivity({ entityId: "prompt-1", entityType: "prompt", kind: "created", title: "Prompt", route: "/prompts/prompt-1" })}>activity</button>
    <button onClick={() => workspace.togglePreference("prompt-1", "prompt", "favorite")}>favorite</button>
    <button onClick={() => workspace.addNotification({ type: "information", title: { he: "הודעה", en: "Notice" }, message: { he: "מקומי", en: "Local" } })}>notify</button>
    <button onClick={() => first && workspace.markRead(first.id)}>read</button>
    <button onClick={workspace.markAllRead}>read all</button>
    <button onClick={() => first && workspace.deleteNotification(first.id)}>delete</button>
    <button onClick={() => workspace.track("searchPerformed", { category: "prompt", quality: 90 })}>track</button>
    <button onClick={() => workspace.setAnalyticsEnabled(false)}>disable analytics</button>
    <button onClick={() => workspace.reset("preferences")}>reset preferences</button>
  </div>;
}

describe("WorkspaceProvider", () => {
  beforeEach(() => localStorage.clear());

  it("coordinates activity, preferences, notifications, analytics, and isolated reset", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={["/prompts"]}><WorkspaceProvider><Harness /></WorkspaceProvider></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: "activity" }));
    await user.click(screen.getByRole("button", { name: "favorite" }));
    await user.click(screen.getByRole("button", { name: "notify" }));
    expect(screen.getByTestId("activity")).not.toHaveTextContent("0");
    expect(screen.getByTestId("preferences")).toHaveTextContent("1");
    expect(screen.getByTestId("unread")).toHaveTextContent("1");
    await user.click(screen.getByRole("button", { name: "read" }));
    expect(screen.getByTestId("unread")).toHaveTextContent("0");
    await user.click(screen.getByRole("button", { name: "read all" }));
    await user.click(screen.getByRole("button", { name: "track" }));
    expect(Number(screen.getByTestId("analytics").textContent)).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "disable analytics" }));
    const analyticsCount = screen.getByTestId("analytics").textContent;
    await user.click(screen.getByRole("button", { name: "track" }));
    expect(screen.getByTestId("analytics")).toHaveTextContent(analyticsCount ?? "");
    await user.click(screen.getByRole("button", { name: "reset preferences" }));
    expect(screen.getByTestId("preferences")).toHaveTextContent("0");
    await user.click(screen.getByRole("button", { name: "delete" }));
    expect(screen.getByTestId("notifications")).toHaveTextContent("0");
  });
});
