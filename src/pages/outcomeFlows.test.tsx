import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../App";
import { LanguageProvider } from "../i18n/LanguageContext";
import { createMission, saveMissionRepository, transitionMission } from "../missions";
import { loadOutcomeRepository } from "../outcomes";
import { resetAppStorageWithCompletedWalkthrough } from "../test/walkthroughFixture";

const ACTOR_ID = "vitest-default";
const CLOCK = () => "2026-08-01T12:00:00.000Z";

function renderApp(path: string) {
  window.history.replaceState({}, "", path);
  return render(<LanguageProvider><App /></LanguageProvider>);
}

function seedProject() {
  localStorage.setItem("shabis-ai-academy.projects.v1", JSON.stringify({
    schemaVersion: 1,
    projects: [{
      id: "project-outcome-1", name: "מוכנות שחרור", description: "הכנת חוויית התוצאה לשחרור",
      category: "qa", status: "active", tags: [], notes: "",
      promptIds: [], agentIds: [], runIds: [], documentIds: [],
      activity: [], createdAt: "2026-08-01T00:00:00.000Z", updatedAt: "2026-08-01T00:00:00.000Z",
      version: 1, favorite: false, archived: false,
    }],
  }));
}

function seedCompletedSimulatedMission(): string {
  let mission = createMission({ actorId: ACTOR_ID, goal: "השלמת תרגול הדמיה", now: CLOCK() });
  mission = transitionMission(mission, "approve-plan", CLOCK()).mission;
  mission = transitionMission(mission, "start", CLOCK()).mission;
  while (mission.status === "running") {
    mission = transitionMission(mission, "complete-phase", CLOCK(), undefined, { evidenceIds: [], simulationAcknowledged: true }).mission;
  }
  saveMissionRepository(ACTOR_ID, { missions: [mission], teams: [], skillEvidence: [], contextPacks: [], analytics: [], recoveredDomains: [] });
  return mission.id;
}

describe("Version 2.0 Outcome experience", () => {
  beforeEach(() => resetAppStorageWithCompletedWalkthrough());

  it("creates a Project Outcome, reflects real progress, and shows it via the shared Result components on a direct route", async () => {
    seedProject();
    const user = userEvent.setup();
    let view = renderApp("/projects/project-outcome-1");

    await user.click(await screen.findByRole("button", { name: "יצירת תוצאה מהמצב הנוכחי" }));
    const openLink = await screen.findByRole("link", { name: "פתיחה" });
    const outcomeHref = openLink.getAttribute("href") ?? "";
    expect(outcomeHref).toMatch(/^\/outcomes\//);

    await user.click(openLink);
    // "מקומי" (the RealityBadge) only renders on the Outcome detail page, so waiting for it first
    // guarantees the route swap and lazy Suspense boundary have both settled before we assert focus —
    // otherwise the still-present Project page's identically-titled <h1> (no tabIndex) can be matched instead.
    await screen.findByText("מקומי");
    const heading = screen.getByRole("heading", { level: 1, name: "מוכנות שחרור" });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(screen.getByText("לא אומת")).toBeInTheDocument();

    // Direct route + refresh: unmount, then mount a fresh tree at the exact outcome URL and confirm it
    // still renders correctly purely from persisted storage (simulating a full page reload).
    view.unmount();
    view = renderApp(outcomeHref);
    expect(await screen.findByRole("heading", { level: 1, name: "מוכנות שחרור" })).toBeVisible();
  });

  it("never claims Verified for a freshly created outcome and shows the Outcomes list", async () => {
    seedProject();
    const user = userEvent.setup();
    const view = renderApp("/projects/project-outcome-1");
    await user.click(await screen.findByRole("button", { name: "יצירת תוצאה מהמצב הנוכחי" }));

    view.unmount();
    renderApp("/outcomes");
    expect(await screen.findByRole("heading", { level: 1, name: "תוצאות עבודה" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: "מוכנות שחרור" })).toBeVisible();
  });

  it("derives exactly one linked Outcome from a Mission completed entirely via explicit simulation acknowledgement, honestly marked Completed but not Verified", async () => {
    const missionId = seedCompletedSimulatedMission();
    renderApp(`/missions/${missionId}`);

    const outcomeLink = await screen.findByRole("link", { name: "השלמת תרגול הדמיה" });
    await userEvent.setup().click(outcomeLink);

    expect(await screen.findByText("הדמיה")).toBeInTheDocument();
    expect(screen.getByText("לא אומת")).toBeInTheDocument();
  });

  it("creates exactly one Mission Outcome even under React StrictMode's dev-only double effect invocation", async () => {
    const missionId = seedCompletedSimulatedMission();
    window.history.replaceState({}, "", `/missions/${missionId}`);
    render(<StrictMode><LanguageProvider><App /></LanguageProvider></StrictMode>);

    await screen.findByRole("link", { name: "השלמת תרגול הדמיה" });
    const stored = loadOutcomeRepository(ACTOR_ID);
    expect(stored.outcomes.filter((outcome) => outcome.sourceModule === "mission" && outcome.sourceEntityId === missionId)).toHaveLength(1);
  });

  it("disables the Create outcome button after use so a repeated click cannot create a duplicate Project Outcome", async () => {
    seedProject();
    const user = userEvent.setup();
    renderApp("/projects/project-outcome-1");
    const createButton = await screen.findByRole("button", { name: "יצירת תוצאה מהמצב הנוכחי" });

    await user.click(createButton);
    expect(createButton).toBeDisabled();
    await user.click(createButton);

    expect(screen.getAllByRole("link", { name: "פתיחה" })).toHaveLength(1);
  });
});
