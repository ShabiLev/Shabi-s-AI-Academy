import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ApprovalDialog } from "./ApprovalDialog";

const labels = {
  title: "Approval required",
  description: "Review the simulated action before it continues.",
  risk: "Risk",
  riskValue: "High",
  action: "Action",
  actionText: "Write a local test record",
  consequence: "Consequence",
  consequenceText: "The local simulation will continue",
  approve: "Approve local simulation",
  reject: "Reject and cancel",
};

describe("ApprovalDialog", () => {
  it("traps keyboard focus, supports both decisions, and restores prior focus", async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    const onReject = vi.fn();
    const opener = document.createElement("button");
    opener.textContent = "Open approval";
    document.body.append(opener);
    opener.focus();

    const view = render(
      <ApprovalDialog labels={labels} onApprove={onApprove} onReject={onReject} />,
    );
    const heading = screen.getByRole("heading", { name: labels.title });
    const approve = screen.getByRole("button", { name: labels.approve });

    expect(heading).toHaveFocus();
    approve.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(heading).toHaveFocus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(approve).toHaveFocus();

    await user.click(approve);
    expect(onApprove).toHaveBeenCalledOnce();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onReject).toHaveBeenCalledOnce();

    view.unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });
});

