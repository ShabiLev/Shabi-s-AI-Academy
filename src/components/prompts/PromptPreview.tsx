import { useState } from "react";
import { buildPrompt } from "../../prompts/promptTemplate";
import { evaluatePrompt } from "../../prompts/promptQuality";
import { promptUi } from "../../prompts/uiText";
import type { PromptInput } from "../../prompts/types";
export function PromptPreview({
  value,
  ui,
}: {
  value: Partial<PromptInput>;
  ui: "he" | "en";
}) {
  const [m, setM] = useState(""),
    text = buildPrompt(value, ui),
    quality = evaluatePrompt(value),
    s = promptUi[ui];
  const copy = async () => {
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement("textarea");
        area.value = text;
        document.body.append(area);
        area.select();
        document.execCommand("copy");
        area.remove();
      }
      setM(s.copied);
    } catch {
      setM(s.copyError);
    }
  };
  return (
    <aside className="prompt-preview">
      <div className="preview-heading">
        <h2>{s.preview}</h2>
        <button type="button" onClick={copy}>
          {s.copy}
        </button>
      </div>
      <pre tabIndex={0} aria-label={s.preview}>
        {text || "—"}
      </pre>
      <section className="quality-panel" aria-label={s.quality}>
        <h3>
          {s.quality}: {quality.score}/100 — {s[quality.label]}
        </h3>
        <p>{s.disclaimer}</p>
        <ul>
          {quality.checks.map((c) => (
            <li key={c.key}>
              {c.key}: {c.earned}/{c.max}
            </li>
          ))}
        </ul>
      </section>
      <p aria-live="polite">{m}</p>
    </aside>
  );
}
