import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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
    expect(screen.getAllByLabelText("Weight")).toHaveLength(builtInRubrics[0].criteria.length);
    expect(screen.getByText(/source preserved/i)).toBeVisible();
  });

  it("saves an edited user rubric as a new immutable lineage version", async () => {
    const source = { ...structuredClone(builtInRubrics[0]), id: "rubric-user-1", source: "user" as const, sourceRubricId: builtInRubrics[0].id };
    const onSave = vi.fn();
    render(<RubricBuilder language="en" rubric={source} onSave={onSave} />);
    await userEvent.click(screen.getByRole("button", { name: /create new version/i }));
    await userEvent.click(screen.getByRole("button", { name: /save immutable version/i }));
    expect(onSave).toHaveBeenCalledOnce();
    const saved = onSave.mock.calls[0][0];
    expect(saved.id).not.toBe(source.id);
    expect(saved.sourceRubricId).toBe(source.id);
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
    expect(screen.getByText("2 of 2 events shown")).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByRole("combobox", { name: /filter by phase/i }), "setup");
    expect(screen.getByText("1 of 1 events shown")).toBeInTheDocument();
    expect(screen.getByText(/versions were frozen/i)).toBeVisible();
    expect(screen.queryByText(/simulation output was produced/i)).not.toBeInTheDocument();
  });

  it("shows unavailable connector state without enabling a write action", () => {
    render(<ConnectorPreview language="en" />);
    expect(screen.getByText("Unavailable")).toBeVisible();
    expect(screen.getByText(/will not write to GitHub/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /connector unavailable/i })).toBeDisabled();
  });

  it("shows an expired preview and offers a fresh local draft", () => {
    render(<ConnectorPreview language="en" preview={{ schemaVersion: 1, id: "preview-1", connectorType: "github", actionType: "draft", targetSummary: "Evaluation", payloadSummary: { he: "טיוטה", en: "Draft" }, requiredPermissions: ["repository:read"], riskLevel: "low", reversible: true, status: "expired", createdAt: "2026-07-30T00:00:00.000Z", expiresAt: "2026-07-30T01:00:00.000Z" }} onSave={() => undefined} />);
    expect(screen.getByText("Expired")).toBeVisible();
    expect(screen.getByRole("button", { name: /fresh local draft/i })).toBeEnabled();
  });
});
