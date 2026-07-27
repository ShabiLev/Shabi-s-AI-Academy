import { useState } from "react";
import { clearLocalFeedback } from "../../feedback";
import {
  exportGuestProfile,
  GUEST_PROFILE_MAX_BYTES,
  previewGuestImport,
  type GuestImportPreview,
  type GuestImportStrategy,
  useGuestProfile,
} from "../../guest-profile";
import { useLanguage } from "../../i18n/LanguageContext";
import { useWorkspace } from "../../workspace";

const interestOptions = [
  { id: "evaluation", he: "QA ובדיקות", en: "QA and testing" },
  { id: "sql", he: "SQL ונתונים", en: "SQL and data" },
  { id: "product", he: "מוצר", en: "Product" },
  { id: "developer-tools", he: "פיתוח וכלים", en: "Development and tools" },
  { id: "prompting", he: "Prompting", en: "Prompting" },
  { id: "agents", he: "Agents", en: "Agents" },
  { id: "automation", he: "אוטומציה", en: "Automation" },
  { id: "models", he: "מחקר ומודלים", en: "Research and models" },
] as const;

export function GuestDataSettings({ onStatus }: { onStatus: (message: string) => void }) {
  const { language } = useLanguage();
  const workspace = useWorkspace();
  const guest = useGuestProfile();
  const [preview, setPreview] = useState<GuestImportPreview>();
  const [strategy, setStrategy] = useState<GuestImportStrategy>("merge");
  const he = language === "he";
  const exportProfile = () => {
    const exported = exportGuestProfile(guest.profile);
    const url = URL.createObjectURL(new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `shabis-ai-academy-guest-profile-${exported.exportedAt.slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return <>
    <section className="settings-card">
      <h2>{he ? "תחומי עניין ותדריך" : "Interests and briefing"}</h2>
      <p>{he ? "אין בחירות חובה. אפשר לשנות את ההתאמה המקומית בכל עת." : "Nothing is required. You can change local personalization at any time."}</p>
      <fieldset>
        <legend>{he ? "תחומי עניין" : "Interests"}</legend>
        <div className="settings-check-grid">{interestOptions.map((interest) => <label className="check-filter" key={interest.id}>
          <input type="checkbox" checked={guest.profile.selectedTopics.includes(interest.id)} onChange={() => guest.toggleFollowTopic(interest.id)} />
          {interest[language]}
        </label>)}</div>
      </fieldset>
      <label className="check-filter">
        <input type="checkbox" checked={guest.profile.briefingPreferences.enabled} onChange={(event) => guest.update((profile) => ({
          ...profile,
          briefingPreferences: { ...profile.briefingPreferences, enabled: event.target.checked },
        }))} />
        {he ? "הפעלת תדריך יומי מקומי" : "Enable local daily briefing"}
      </label>
      <label>{he ? "שפת התדריך" : "Briefing language"}<select value={guest.profile.briefingPreferences.locale} onChange={(event) => guest.update((profile) => ({
        ...profile,
        briefingPreferences: { ...profile.briefingPreferences, locale: event.target.value === "en" ? "en" : "he" },
      }))}><option value="he">עברית</option><option value="en">English</option></select></label>
      <label className="check-filter">
        <input type="checkbox" checked={guest.profile.notificationPreferences.inApp} onChange={(event) => guest.update((profile) => ({
          ...profile,
          notificationPreferences: { ...profile.notificationPreferences, inApp: event.target.checked },
        }))} />
        {he ? "התראות בתוך האפליקציה בלבד" : "In-app notifications only"}
      </label>
    </section>
    <section className="settings-card">
      <h2>{he ? "הסכמה לניתוח שימוש מקומי" : "Local analytics consent"}</h2>
      <p>{he
        ? "כבוי כברירת מחדל. נשמרים רק סוגי פעולות וקטגוריות בדפדפן; לא תוכן, חיפושים, מסמכים או זהות."
        : "Off by default. Only action types and categories stay in this browser; never content, searches, documents, or identity."}</p>
      <label className="check-filter">
        <input type="checkbox" checked={guest.profile.consent.analytics && workspace.state.analyticsEnabled} onChange={(event) => {
          const enabled = event.target.checked;
          guest.update((profile) => ({
            ...profile,
            consent: { ...profile.consent, analytics: enabled, updatedAt: new Date().toISOString() },
          }));
          workspace.setAnalyticsEnabled(enabled);
          if (!enabled) workspace.reset("analytics");
        }} />
        {he ? "אני מסכים/ה לניתוח שימוש מקומי" : "I consent to local usage analytics"}
      </label>
      <button type="button" onClick={() => {
        workspace.reset("analytics");
        clearLocalFeedback();
        onStatus(he ? "ניתוח השימוש והמשוב המקומי נוקו." : "Local analytics and feedback were cleared.");
      }}>{he ? "איפוס ניתוח ומשוב" : "Reset analytics and feedback"}</button>
    </section>
    <section className="settings-card backup-settings">
      <h2>{he ? "פרופיל אורח מקומי" : "Local guest profile"}</h2>
      <p>{he
        ? "כולל העדפות Radar, מעקבים, שמורים, מצב קריאה, חיפושים והסכמות. המזהה המקומי אינו חשבון ואינו מועבר לענן."
        : "Includes Radar preferences, follows, saved/read state, searches, and consent. The local identifier is not an account and is not cloud-transmitted."}</p>
      <button type="button" onClick={exportProfile}>{he ? "ייצוא פרופיל אורח" : "Export guest profile"}</button>
      <label>
        {he ? "בחירת פרופיל אורח לייבוא" : "Choose guest-profile import"}
        <input type="file" accept="application/json,.json" onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (file.size > GUEST_PROFILE_MAX_BYTES) {
            setPreview({ valid: false, errors: ["oversized-import"], changes: {} });
            onStatus(he ? "קובץ הייבוא גדול מ־512KB ונדחה לפני קריאה." : "The import exceeds 512KB and was rejected before reading.");
            return;
          }
          const next = previewGuestImport(await file.text(), guest.profile);
          setPreview(next);
          onStatus(next.valid
            ? (he ? "הפרופיל תקין. בחרו מיזוג או החלפה." : "Profile validated. Choose merge or replace.")
            : next.errors.join(", "));
        }} />
      </label>
      {preview && <div className="import-preview">
        <p>{Object.entries(preview.changes).map(([key, value]) => `${key}: ${value}`).join(" · ") || (he ? "אין תוספות" : "No additions")}</p>
        <label>{he ? "אסטרטגיה" : "Strategy"}<select value={strategy} onChange={(event) => setStrategy(event.target.value as GuestImportStrategy)}>
          <option value="merge">{he ? "מיזוג" : "Merge"}</option>
          <option value="replace">{he ? "החלפה — שמירת המזהה המקומי" : "Replace — keep local ID"}</option>
        </select></label>
        <button type="button" disabled={!preview.valid} onClick={() => {
          const report = guest.repository.applyImport(preview, strategy);
          onStatus(report.ok
            ? (he ? "פרופיל האורח יובא. הדף ייטען מחדש." : "Guest profile imported. The page will reload.")
            : report.rolledBack ? (he ? "הייבוא נכשל ובוצע rollback." : "Import failed and rolled back.")
              : report.errors.join(", "));
          if (report.ok) window.setTimeout(() => location.reload(), 100);
        }}>{he ? "אישור ייבוא" : "Confirm import"}</button>
      </div>}
      <button className="danger-button" type="button" onClick={() => {
        if (window.confirm(he ? "לאפס את כל העדפות האורח במכשיר הזה?" : "Reset all guest preferences on this device?")) {
          guest.reset();
          workspace.setAnalyticsEnabled(false);
          workspace.reset("analytics");
          onStatus(he ? "פרופיל האורח אופס." : "Guest profile reset.");
        }
      }}>{he ? "איפוס פרופיל אורח" : "Reset guest profile"}</button>
    </section>
  </>;
}
