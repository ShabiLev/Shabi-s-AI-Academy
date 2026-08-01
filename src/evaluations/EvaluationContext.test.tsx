import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EvaluationProvider, useEvaluations } from "./EvaluationContext";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

function Probe() {
  const evaluations = useEvaluations();
  return (
    <>
      <output data-testid="actor">{evaluations.actorId}</output>
      <output data-testid="experiments">{evaluations.experiments.length}</output>
      <button type="button" onClick={() => evaluations.createExperiment({
        id: "experiment-isolation",
        actorId: evaluations.actorId,
        name: "Actor isolation",
        missionSnapshotId: "mission-snapshot",
        competitorIds: ["agent-a", "agent-b"],
        rubricId: "release-readiness",
        evaluatorIds: ["reality-checker"],
        repetitionCount: 1,
        seed: "fixed-seed",
        createdAt: "2026-07-30T10:00:00.000Z",
        updatedAt: "2026-07-30T10:00:00.000Z",
      })}>Create</button>
    </>
  );
}

describe("EvaluationProvider actor isolation", () => {
  it("reloads actor state without exposing or merging the previous actor repository", () => {
    const storage = new MemoryStorage();
    const view = render(
      <EvaluationProvider actorId="actor-a" storage={storage}><Probe /></EvaluationProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(screen.getByTestId("actor")).toHaveTextContent("actor-a");
    expect(screen.getByTestId("experiments")).toHaveTextContent("1");

    view.rerender(
      <EvaluationProvider actorId="actor-b" storage={storage}><Probe /></EvaluationProvider>,
    );
    expect(screen.getByTestId("actor")).toHaveTextContent("actor-b");
    expect(screen.getByTestId("experiments")).toHaveTextContent("0");

    view.rerender(
      <EvaluationProvider actorId="actor-a" storage={storage}><Probe /></EvaluationProvider>,
    );
    expect(screen.getByTestId("experiments")).toHaveTextContent("1");
  });
});
