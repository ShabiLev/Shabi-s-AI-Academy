import { useEffect, useRef } from "react";
export function ApprovalDialog({
  labels,
  onApprove,
  onReject,
}: {
  labels: {
    title: string;
    description: string;
    risk: string;
    riskValue: string;
    action: string;
    actionText: string;
    consequence: string;
    consequenceText: string;
    approve: string;
    reject: string;
  };
  onApprove: () => void;
  onReject: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  useEffect(() => {
    previous.current = document.activeElement as HTMLElement;
    heading.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onReject();
      if (event.key === "Tab") {
        const dialog = heading.current?.closest<HTMLElement>(
          "[role='alertdialog']",
        );
        const controls = dialog?.querySelectorAll<HTMLElement>(
          "[tabindex='-1'], button:not(:disabled)",
        );
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous.current?.focus();
    };
  }, [onReject]);
  return (
    <div className="modal-layer">
      <section
        className="confirm-dialog runtime-approval"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="approval-title"
        aria-describedby="approval-description"
      >
        <h2 ref={heading} tabIndex={-1} id="approval-title">
          {labels.title}
        </h2>
        <p id="approval-description">{labels.description}</p>
        <dl>
          <div>
            <dt>{labels.risk}</dt>
            <dd>{labels.riskValue}</dd>
          </div>
          <div>
            <dt>{labels.action}</dt>
            <dd>{labels.actionText}</dd>
          </div>
          <div>
            <dt>{labels.consequence}</dt>
            <dd>{labels.consequenceText}</dd>
          </div>
        </dl>
        <div>
          <button type="button" onClick={onReject}>
            {labels.reject}
          </button>
          <button type="button" onClick={onApprove}>
            {labels.approve}
          </button>
        </div>
      </section>
    </div>
  );
}
