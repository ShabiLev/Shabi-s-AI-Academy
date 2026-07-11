import { useEffect, useRef } from "react";
export function ConfirmDialog({
  title,
  description,
  cancel,
  confirm,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  cancel: string;
  confirm: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  useEffect(() => {
    previous.current = document.activeElement as HTMLElement;
    ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); previous.current?.focus() };
  }, [onCancel]);
  return (
    <div
      className="modal-layer"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        className="confirm-dialog"
      >
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-description">{description}</p>
        <div>
          <button ref={ref} type="button" onClick={onCancel}>
            {cancel}
          </button>
          <button className="destructive" type="button" onClick={onConfirm}>
            {confirm}
          </button>
        </div>
      </section>
    </div>
  );
}
