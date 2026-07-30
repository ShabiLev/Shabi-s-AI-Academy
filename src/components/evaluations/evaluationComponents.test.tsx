import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ComparisonTable } from "./ComparisonTable";
import { ConnectorPreview } from "./ConnectorPreview";
import { DeterministicNotice } from "./DeterministicNotice";
import { RubricSummary } from "./RubricSummary";
import { RubricBuilder } from "./RubricBuilder";
import { TraceTimeline } from "./TraceTimeline";
import { builtInRubrics } from "../../evaluations";

describe("Version 1.9 evaluation UI", () => {
  it("labels deterministic output honestly in both languages", () => {
    const { rerender } = render(<DeterministicNotice language="en" />);
    expect(screen.getByText("Academy deterministic evaluation")).toBeVisible();
    expect(screen.getByText(/not a live model-provider comparison/i)).toBeVisible();
    rerender(<DeterministicNotice language="he" />);
    expect(screen.getByText("הערכת Academy דטרמיניסטית")).toBeVisible();
  });

  it("renders an accessible evidence-backed comparison table and text alternative", () => {
    render(<ComparisonTable language="en" />);
    const table = screen.getByRole("table", { name: /comparison of two competitors/i });
    expect(within(table).getByRole("columnheader", { name: /criterion/i })).toBeVisible();
    expect(within(table).getByRole("rowheader", { name: /accessibility/i })).toBeVisible();
    expect(screen.getByText(/largest gap is accessibility/i)).toBeVisible();
  });

  it("explains rubric weights and missing-evidence behavior", () => {
    render(<RubricSummary language="en" />);
    expect(screen.getByLabelText(/total weight 100 percent/i)).toHaveTextContent("100%");
    expect(screen.getByText(/missing evidence is not-scored, never zero/i)).toBeVisible();
    expect(screen.getByText(/blocks certification/i)).toBeVisible();
  });

  it("keeps a built-in rubric immutable until it is explicitly cloned", async () => {
    render(<RubricBuilder language="en" rubric={builtInRubrics[0]} />);
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /clone to edit/i }));
    expect(screen.getAllByRole("spinbutton")).toHaveLength(builtInRubrics[0].criteria.length);
    expect(screen.getByText(/built-in source is unchanged/i)).toBeVisible();
  });

  it("filters the safe trace and announces the visible event count", async () => {
    const events = [{
      schemaVersion: 1 as const, id: "trace-1", runId: "run-1", sequence: 1,
      timestamp: "2026-07-30T12:00:00.000Z", actorType: "system" as const,
      actorId: "academy", eventType: "snapshot" as const,
      summary: { he: "הגרסאות הוקפאו.", en: "Versions were frozen." },
      evidenceIds: [], metadata: { phase: "setup", gateStatus: "PASS" as const },
    }, {
      schemaVersion: 1 as const, id: "trace-2", runId: "run-1", sequence: 2,
      timestamp: "2026-07-30T12:00:01.000Z", actorType: "evaluator" as const,
      actorId: "reviewer", eventType: "evaluation" as const,
      summary: { he: "ההערכה הושלמה.", en: "Evaluation completed." },
      evidenceIds: ["evidence-1"], metadata: { phase: "evaluation", gateStatus: "PASS" as const },
    }];
    render(<TraceTimeline language="en" events={events} />);
    expect(screen.getByText("2 events shown")).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: /filter by phase/i }), "setup");
    expect(screen.getByText("1 events shown")).toBeInTheDocument();
    expect(screen.getByText(/versions were frozen/i)).toBeVisible();
    expect(screen.queryByText(/simulation output was produced/i)).not.toBeInTheDocument();
  });

  it("shows unavailable connector state without enabling a write action", () => {
    render(<ConnectorPreview language="en" />);
    expect(screen.getByText("Unavailable")).toBeVisible();
    expect(screen.getByText(/will not write to GitHub/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /connector unavailable/i })).toBeDisabled();
  });
});
