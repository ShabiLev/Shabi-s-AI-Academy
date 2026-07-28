const timestamp = "2026-07-26T12:00:00.000Z";
const actorId = "vitest-default";

export function resetAppStorageWithCompletedWalkthrough(): void {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.localStorage.setItem("shabis-ai-academy:guest-profile:v1", JSON.stringify({
    schemaVersion: 1,
    anonymousProfileId: actorId,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastSeenAt: timestamp,
  }));
  window.localStorage.setItem(`shabis-ai-academy:walkthrough:v1:${actorId}`, JSON.stringify({
    schemaVersion: 1,
    tourId: "first-visit-v1",
    tourVersion: "1.7",
    status: "completed",
    currentStep: 7,
    firstStartedAt: timestamp,
    updatedAt: timestamp,
    completedAt: timestamp,
    language: "he",
  }));
}
