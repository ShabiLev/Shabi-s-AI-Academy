import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { getGlossaryTerm } from "./glossaryData";

export function GlossaryTrigger({ termId }: { termId: string }) {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const term = getGlossaryTerm(termId);
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); buttonRef.current?.focus(); } };
    const onPointer = (event: MouseEvent) => { if (!dialogRef.current?.contains(event.target as Node) && !buttonRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("keydown", onKey); document.addEventListener("mousedown", onPointer);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onPointer); };
  }, [open]);
  if (!term) return null;
  return <span className="glossary-trigger-wrap">
    <button ref={buttonRef} type="button" className="glossary-trigger" aria-expanded={open} aria-controls={id} title={term.definition[language]} onClick={() => setOpen((value) => !value)}><span aria-hidden="true">?</span><span className="sr-only">{language === "he" ? `מידע על ${term.name.he}` : `About ${term.name.en}`}</span></button>
    {open && <div ref={dialogRef} id={id} tabIndex={-1} className="glossary-popover" role="dialog" aria-label={term.name[language]}><strong>{term.name[language]}</strong><p>{term.definition[language]}</p><p>{term.example[language]}</p>{term.availability && <p className="notice-inline">{term.availability[language]}</p>}<Link to={`/glossary#${term.id}`} onClick={() => setOpen(false)}>{language === "he" ? "פתחו במילון" : "Open in glossary"}</Link></div>}
  </span>;
}
