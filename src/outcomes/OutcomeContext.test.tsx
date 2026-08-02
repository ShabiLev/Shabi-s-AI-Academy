import { act, render, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { describe, expect, it, vi } from "vitest";
import { OutcomeProvider, useOutcomes } from "./OutcomeContext";
import type { Deliverable } from "./types";

const actorState = vi.hoisted(() => ({ id: "guest-a" }));

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("../guest-profile", () => ({
  useGuestProfile: () => ({ profile: { anonymousProfileId: actorState.id } }),
}));

function Probe({ onChange }: { onChange: (value: ReturnType<typeof useOutcomes>) => void }) {
  const outcomes = useOutcomes();
  useEffect(() => onChange(outcomes), [onChange, outcomes]);
  return null;
}

describe("OutcomeProvider", () => {
  it("links child records atomically and reloads an isolated store when the actor changes", async () => {
    actorState.id = "guest-a";
    const onChange = vi.fn<(value: ReturnType<typeof useOutcomes>) => void>();
    const current = () => onChange.mock.calls.at(-1)?.[0];
    const view = render(<OutcomeProvider><Probe onChange={onChange} /></OutcomeProvider>);

    let createdId = "";
    act(() => {
      const created = current()?.create({
        title: "Release outcome",
        summary: "A bounded local result",
        intent: "Prepare a release",
        status: "ready",
        realityMode: "local",
        sourceModule: "project",
        sourceEntityId: "project-1",
        resultType: "project-outcome",
        resultLocation: "/projects/project-1",
        usageInstructions: "Review and attach evidence.",
        nextActions: [],
        limitations: ["Browser-local only"],
        deliverableIds: [],
        evidenceIds: [],
        verificationState: "unverified",
      });
      expect(created).toBeDefined();
      createdId = created?.id ?? "";
    });

    const deliverable: Deliverable = {
      schemaVersion: 2,
      id: "deliverable-1",
      actorId: "guest-a",
      outcomeId: createdId,
      title: "Release report",
      resultType: "document",
      location: "browser-local:project-1",
      usageInstructions: "Export and review.",
      sourceEntityId: "project-1",
      sourceEntityVersion: 1,
      contentHash: "fnv1a32-12345678",
      createdAt: "2026-08-01T12:00:00.000Z",
      updatedAt: "2026-08-01T12:00:00.000Z",
      version: 1,
    };
    act(() => {
      expect(current()?.addDeliverable(deliverable)).toBe(true);
    });
    expect(current()?.outcomes[0].deliverableIds).toEqual([deliverable.id]);

    actorState.id = "guest-b";
    view.rerender(<OutcomeProvider><Probe onChange={onChange} /></OutcomeProvider>);
    await waitFor(() => expect(current()?.actorId).toBe("guest-b"));
    await waitFor(() => expect(current()?.outcomes).toEqual([]));
  });
});
