import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { saveLocalFeedback, type FeedbackCategory } from "../feedback";
import { useGuestProfile } from "../guest-profile";
import { useLanguage } from "../i18n/LanguageContext";
import {
  buildRadarBriefing,
  calculateWhatChanged,
  groupRadarRecords,
  rankRadarRecords,
  recommendationExplanation,
  useRadar,
  type RadarRecord,
} from "../radar";
import type { RadarErrorCode } from "../radar/providers";

type RadarView = "latest" | "recommended" | "important" | "following" | "israel" | "saved" | "recent";

const viewLabels: Record<RadarView, { he: string; en: string }> = {
  latest: { he: "העדכונים האחרונים", en: "Latest" },
  recommended: { he: "מומלץ עבורך", en: "For you" },
  important: { he: "חשוב", en: "Important" },
  following: { he: "במעקב", en: "Following" },
  israel: { he: "ישראל תחילה", en: "Israel First" },
  saved: { he: "שמורים וקריאה מאוחרת", en: "Saved & Read Later" },
  recent: { he: "נצפו לאחרונה", en: "Recently Viewed" },
};

const errorMessages: Record<RadarErrorCode, { he: string; en: string }> = {
  RADAR_OFFLINE: { he: "אין חיבור לעדכון. מוצג המטמון האחרון.", en: "Refresh is offline. The last cache is shown." },
  RADAR_TIMEOUT: { he: "העדכון חרג מהזמן. מוצג המטמון האחרון.", en: "Refresh timed out. The last cache is shown." },
  RADAR_PROVIDER_UNAVAILABLE: { he: "ה־feed אינו זמין. מוצג fallback שנבדק.", en: "The feed is unavailable. A reviewed fallback is shown." },
  RADAR_INVALID_RESPONSE: { he: "התגובה נדחתה בבדיקת אבטחה.", en: "The response was rejected by security validation." },
  RADAR_RATE_LIMITED: { he: "המקור הגביל את קצב הבקשות.", en: "The source rate-limited refresh." },
  RADAR_UNKNOWN_ERROR: { he: "העדכון נכשל מסיבה לא ידועה.", en: "Refresh failed for an unknown reason." },
};

const sectionLabels = {
  top: { he: "ההתפתחויות המרכזיות", en: "Top AI developments" },
  agents: { he: "Agents ו־Prompting", en: "Agents and Prompting" },
  qa: { he: "QA ובדיקות תוכנה", en: "QA and software testing" },
  israel: { he: "AI בישראל", en: "Israel and local AI" },
  tools: { he: "כלים שכדאי לנסות", en: "Tools worth trying" },
};

const categoryLabels: Record<string, { he: string; en: string }> = {
  agents: { he: "סוכנים", en: "Agents" },
  education: { he: "חינוך", en: "Education" },
  evaluation: { he: "הערכה ובדיקות", en: "Evaluation and testing" },
  governance: { he: "מדיניות וממשל", en: "Policy and governance" },
  models: { he: "מודלים", en: "Models" },
  "open-source": { he: "קוד פתוח וכלי פיתוח", en: "Open source and developer tools" },
  prompting: { he: "Prompting", en: "Prompting" },
  safety: { he: "בטיחות", en: "Safety" },
};
const freshnessLabels: Record<string, { he: string; en: string }> = {
  fresh: { he: "חדש", en: "Fresh" },
  aging: { he: "מתיישן", en: "Aging" },
  stale: { he: "ישן", en: "Stale" },
};

function localized(record: RadarRecord, field: "title" | "summary" | "whyItMatters", language: "he" | "en") {
  const value = record[field][language];
  return value || record[field].en || record[field].he;
}

export function RadarPage() {
  const { language } = useLanguage();
  const radar = useRadar();
  const guest = useGuestProfile();
  const [view, setView] = useState<RadarView>("latest");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [source, setSource] = useState("all");
  const [searchName, setSearchName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [showBriefing, setShowBriefing] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>("general");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [renamingSearchId, setRenamingSearchId] = useState("");
  const [renamingSearchName, setRenamingSearchName] = useState("");
  const [visibleLimit, setVisibleLimit] = useState(24);
  const [visitLastSeenAt] = useState(() => guest.profile.lastSeenAt);
  const visitRecorded = useRef(false);
  const he = language === "he";
  const ranked = useMemo(() => rankRadarRecords(radar.records, guest.profile), [guest.profile, radar.records]);
  const rankedById = useMemo(() => new Map(ranked.map((entry) => [entry.record.canonicalId, entry])), [ranked]);
  const latest = useMemo(() => [...radar.records].sort((left, right) =>
    right.publicationDate.localeCompare(left.publicationDate)
    || right.lastVerifiedAt.localeCompare(left.lastVerifiedAt)), [radar.records]);
  const recentOrder = useMemo(() => new Map(guest.profile.recentViews.map((item, index) => [item.id, index])), [guest.profile.recentViews]);
  const readIds = useMemo(() => new Set(guest.profile.readItems.map((item) => item.id)), [guest.profile.readItems]);
  const groups = useMemo(() => groupRadarRecords(radar.records), [radar.records]);
  const categories = useMemo(() => ["all", ...new Set(radar.records.map((record) => record.category))], [radar.records]);
  const sources = useMemo(() => ["all", ...new Set(radar.records.map((record) => record.sourceId))], [radar.records]);
  const sourceNames = useMemo(() => new Map(radar.records.map((record) => [record.sourceId, record.sourceName])), [radar.records]);
  const activeSourceHealth = useMemo(() => radar.sourceHealth.filter((item) => item.status !== "disabled"), [radar.sourceHealth]);
  const briefing = useMemo(() => buildRadarBriefing(
    { generatedAt: radar.generatedAt, partial: radar.status === "partial" },
    radar.records,
    guest.profile,
    radar.status !== "online",
  ), [guest.profile, radar.generatedAt, radar.records, radar.status]);
  const changed = useMemo(() => calculateWhatChanged(radar.records, guest.profile, {
    lastSeenAt: visitLastSeenAt,
    sourceHealth: radar.sourceHealth,
  }), [guest.profile, radar.records, radar.sourceHealth, visitLastSeenAt]);

  const viewRecords = useMemo(() => {
    if (view === "recommended") return ranked.map((entry) => entry.record);
    if (view === "important") return latest.filter((record) =>
      record.relevanceScore >= 80 || record.category === "safety" || record.category === "governance");
    if (view === "following") return ranked.map((entry) => entry.record).filter((record) =>
      record.topics.some((topic) => guest.profile.selectedTopics.includes(topic))
      || guest.profile.selectedSources.includes(record.sourceId)
      || guest.profile.followedKeywords.some((followed) =>
        `${record.title.en} ${record.title.he}`.toLocaleLowerCase().includes(followed.toLocaleLowerCase())));
    if (view === "israel") return ranked.map((entry) => entry.record).filter((record) => (record.israelRelevance ?? 0) >= 40);
    if (view === "saved") return latest.filter((record) => guest.profile.favoriteIds.includes(record.canonicalId));
    if (view === "recent") return latest.filter((record) => recentOrder.has(record.canonicalId))
      .sort((left, right) => (recentOrder.get(right.canonicalId) ?? 0) - (recentOrder.get(left.canonicalId) ?? 0));
    return latest;
  }, [guest.profile, latest, ranked, recentOrder, view]);

  const visible = useMemo(() => viewRecords.filter((record) => {
    const haystack = `${record.title.he} ${record.title.en} ${record.summary.he} ${record.summary.en} ${record.topics.join(" ")}`.toLocaleLowerCase();
    return !guest.profile.dismissedIds.includes(record.canonicalId)
      && (!query.trim() || haystack.includes(query.trim().toLocaleLowerCase()))
      && (category === "all" || record.category === category)
      && (source === "all" || record.sourceId === source);
  }), [category, guest.profile.dismissedIds, query, source, viewRecords]);
  const rendered = visible.slice(0, visibleLimit);

  useEffect(() => {
    if (visitRecorded.current || !radar.records.length) return;
    visitRecorded.current = true;
    guest.update((profile) => ({ ...profile, lastSeenAt: new Date().toISOString() }));
  }, [guest, radar.records.length]);

  const loadSearch = (id: string) => {
    const saved = guest.profile.savedSearches.find((item) => item.id === id);
    if (!saved) return;
    setQuery(saved.query);
    setCategory(saved.topic);
    setSource(saved.sourceId);
    setView((Object.keys(viewLabels) as RadarView[]).includes(saved.view as RadarView) ? saved.view as RadarView : "latest");
    setVisibleLimit(24);
  };
  const addKeyword = () => {
    const value = keyword.trim().slice(0, 80);
    if (!value || guest.profile.followedKeywords.includes(value)) return;
    guest.update((profile) => ({ ...profile, followedKeywords: [...profile.followedKeywords, value].slice(-30) }));
    setKeyword("");
  };
  const submitFeedback = (event: FormEvent) => {
    event.preventDefault();
    const saved = saveLocalFeedback({ category: feedbackCategory, message: feedbackMessage });
    setFeedbackStatus(saved
      ? (he ? "המשוב נשמר במכשיר בלבד. הוא לא נשלח ללא endpoint מאושר." : "Feedback was saved on this device only. It is not transmitted without an approved endpoint.")
      : (he ? "לא ניתן לשמור את המשוב." : "Feedback could not be saved."));
    if (saved) setFeedbackMessage("");
  };
  const exportSavedSearches = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({
      schemaVersion: 1,
      kind: "shabis-ai-academy-radar-searches",
      exportedAt: new Date().toISOString(),
      searches: guest.profile.savedSearches,
    }, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "shabis-ai-academy-radar-searches.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const statusText = {
    cached: he ? "fallback שנבדק" : "Reviewed fallback",
    online: he ? "מעודכן מה־feed הציבורי" : "Live public feed",
    offline: he ? "לא מקוון — מוצג מטמון" : "Offline — cached data",
    unavailable: he ? "feed לא זמין — מוצג fallback" : "Feed unavailable — fallback",
    partial: he ? "עדכון חלקי — חלק מהמקורות נכשלו" : "Partial — some sources failed",
  }[radar.status];

  return <div className="page radar-page">
    <header className="radar-hero">
      <div>
        <span className="eyebrow">{he ? "Public Beta · מקורות מאושרים" : "Public Beta · approved sources"}</span>
        <h1>{he ? "רדאר AI חי" : "Live AI Radar"}</h1>
        <p>{he
          ? "עדכוני AI ממקורות רשמיים ומחקריים, עם fallback מקומי. ההעדפות נשמרות במכשיר הזה ואינן מסונכרנות לענן."
          : "AI updates from official and research sources with a local fallback. Your preferences stay on this device and are not cloud-synced."}</p>
      </div>
      <div className="radar-freshness" data-status={radar.status}>
        <strong>{statusText}</strong>
        <p>{he ? "נוצר" : "Generated"}: <time dateTime={radar.generatedAt}>{new Date(radar.generatedAt).toLocaleString(language)}</time></p>
        <p>{activeSourceHealth.length
          ? `${he ? "מקורות בריאים" : "Healthy sources"}: ${activeSourceHealth.filter((item) => item.status === "healthy").length}/${activeSourceHealth.length}`
          : `${he ? "מקורות fallback שנבדקו" : "Reviewed fallback sources"}: ${new Set(radar.records.map((record) => record.sourceId)).size}`}</p>
        <button type="button" className="button" disabled={radar.refreshing} onClick={() => void radar.refresh()}>
          {radar.refreshing ? (he ? "מעדכן…" : "Refreshing…") : (he ? "ניסיון עדכון" : "Retry refresh")}
        </button>
        {radar.errorCode && <small role="status">{errorMessages[radar.errorCode][language]}</small>}
      </div>
    </header>

    <nav className="radar-view-tabs" aria-label={he ? "תצוגות רדאר" : "Radar views"}>
      {(Object.keys(viewLabels) as RadarView[]).map((item) =>
        <button type="button" key={item} aria-current={view === item ? "page" : undefined} onClick={() => { setView(item); setVisibleLimit(24); }}>
          {viewLabels[item][language]}
        </button>)}
    </nav>

    <section className="radar-controls" aria-label={he ? "סינון ושמירת חיפוש" : "Filter and save search"}>
      <label><span>{he ? "חיפוש" : "Search"}</span><input type="search" value={query} maxLength={160} onChange={(event) => { setQuery(event.target.value); setVisibleLimit(24); }} /></label>
      <label><span>{he ? "קטגוריה" : "Category"}</span><select value={category} onChange={(event) => { setCategory(event.target.value); setVisibleLimit(24); }}>{categories.map((item) => <option key={item} value={item}>{item === "all" ? (he ? "הכול" : "All") : categoryLabels[item]?.[language] ?? item}</option>)}</select></label>
      <label><span>{he ? "מקור" : "Source"}</span><select value={source} onChange={(event) => { setSource(event.target.value); setVisibleLimit(24); }}>{sources.map((item) => <option key={item} value={item}>{item === "all" ? (he ? "כל המקורות" : "All sources") : sourceNames.get(item) ?? item}</option>)}</select></label>
      <label><span>{he ? "שם לחיפוש השמור" : "Saved-search name"}</span><input value={searchName} maxLength={80} onChange={(event) => setSearchName(event.target.value)} /></label>
      <button type="button" disabled={!searchName.trim()} onClick={() => {
        guest.saveSearch({ name: searchName.trim(), query, topic: category, sourceId: source, view });
        setSearchName("");
      }}>{he ? "שמירת החיפוש" : "Save search"}</button>
    </section>

    {guest.profile.savedSearches.length > 0 && <section className="radar-saved-searches" aria-labelledby="saved-searches-title">
      <h2 id="saved-searches-title">{he ? "חיפושים שמורים" : "Saved searches"}</h2>
      <ul>{guest.profile.savedSearches.map((saved) => <li key={saved.id}>
        {renamingSearchId === saved.id ? <>
          <label><span className="sr-only">{he ? "שם חדש" : "New name"}</span><input value={renamingSearchName} maxLength={80} onChange={(event) => setRenamingSearchName(event.target.value)} /></label>
          <button type="button" disabled={!renamingSearchName.trim()} onClick={() => {
            guest.saveSearch({ ...saved, name: renamingSearchName.trim(), id: saved.id });
            setRenamingSearchId("");
          }}>{he ? "אישור שם" : "Save name"}</button>
        </> : <>
          <button type="button" onClick={() => loadSearch(saved.id)}>{saved.name}</button>
          <button type="button" onClick={() => {
            setRenamingSearchId(saved.id);
            setRenamingSearchName(saved.name);
          }}>{he ? "שינוי שם" : "Rename"}</button>
        </>}
        <button type="button" onClick={() => guest.deleteSearch(saved.id)} aria-label={`${he ? "מחיקת" : "Delete"} ${saved.name}`}>×</button>
      </li>)}</ul>
      <div className="inline-actions">
        <button type="button" onClick={exportSavedSearches}>{he ? "ייצוא חיפושים" : "Export searches"}</button>
        <button type="button" onClick={() => guest.update((profile) => ({ ...profile, savedSearches: [] }))}>{he ? "איפוס חיפושים" : "Reset searches"}</button>
      </div>
    </section>}

    <section className="radar-following-tools" aria-labelledby="following-tools-title">
      <div>
        <h2 id="following-tools-title">{he ? "מעקב אחרי מילות מפתח" : "Follow keywords"}</h2>
        <div className="inline-actions"><label><span className="sr-only">{he ? "מילת מפתח למעקב" : "Keyword to follow"}</span><input value={keyword} maxLength={80} onChange={(event) => setKeyword(event.target.value)} /></label><button type="button" onClick={addKeyword}>{he ? "הוספה" : "Add"}</button></div>
      </div>
      <ul>{guest.profile.followedKeywords.map((item) => <li key={item}><span>{item}</span><button type="button" onClick={() => guest.update((profile) => ({ ...profile, followedKeywords: profile.followedKeywords.filter((value) => value !== item) }))} aria-label={`${he ? "הפסקת מעקב" : "Unfollow"} ${item}`}>×</button></li>)}</ul>
    </section>

    <section className="radar-changed" aria-labelledby="changed-title">
      <div><h2 id="changed-title">{he ? "מה השתנה מאז הביקור האחרון" : "What changed since your last visit"}</h2><p>{he ? "מטמון ישן אינו מסומן כחדש; שינוי נקבע לפי זמן, checksum ותיקונים." : "Old cache is never marked new; changes use time, checksum, and correction history."}</p></div>
      <dl>
        <div><dt>{he ? "חדשות חשובות" : "New important"}</dt><dd>{changed.newImportant.length}</dd></div>
        <div><dt>{he ? "עודכנו" : "Updated"}</dt><dd>{changed.updated.length}</dd></div>
        <div><dt>{he ? "תיקונים" : "Corrections"}</dt><dd>{changed.corrections.length}</dd></div>
        <div><dt>{he ? "במעקב" : "Followed updates"}</dt><dd>{changed.followed.length}</dd></div>
        <div><dt>{he ? "מקורות במעקב שנפגעו" : "Impaired followed sources"}</dt><dd>{changed.impairedFollowedSources.length}</dd></div>
      </dl>
    </section>

    <section className="radar-briefing" aria-labelledby="briefing-title">
      <div className="radar-section-heading"><div><h2 id="briefing-title">{he ? "תדריך יומי" : "Daily briefing"}</h2><p>{briefing.sourceCount} {he ? "מקורות" : "sources"} · {briefing.cached ? (he ? "מבוסס מטמון" : "cached") : (he ? "עדכני" : "current")}{briefing.partial ? ` · ${he ? "כיסוי חלקי" : "partial coverage"}` : ""}</p></div><button type="button" aria-expanded={showBriefing} onClick={() => setShowBriefing((value) => !value)}>{showBriefing ? (he ? "סגירה" : "Close") : (he ? "פתיחת התדריך" : "Open briefing")}</button></div>
      {showBriefing && (briefing.sections.length ? <div className="briefing-sections">{briefing.sections.map((section) => <section key={section.id}><h3>{sectionLabels[section.id][language]}</h3><ol>{section.records.map((record) => <li key={record.canonicalId}>{localized(record, "title", language)}</li>)}</ol></section>)}{briefing.practicalIdeas.length > 0 && <section><h3>{he ? "רעיונות מעשיים" : "Practical ideas"}</h3><ol>{briefing.practicalIdeas.map((idea) => <li key={idea}>{he ? {
        "compare-sources": "השוו כיסוי של אותו נושא בין שני מקורות.",
        "test-a-workflow": "נסו עדכון אחד בתהליך עבודה או agent מקומי.",
        "update-a-quality-checklist": "עדכנו בדיקת QA אחת לפי שינוי משמעותי.",
      }[idea] : {
        "compare-sources": "Compare the same topic across two sources.",
        "test-a-workflow": "Try one update in a local workflow or agent.",
        "update-a-quality-checklist": "Update one QA check from an important change.",
      }[idea]}</li>)}</ol></section>}</div> : <div className="empty-state"><h3>{he ? "אין תוכן לתדריך" : "No briefing content"}</h3><p>{he ? "לא ייווצר תוכן מומצא כאשר ה־feed ריק." : "No content is fabricated when the feed is empty."}</p></div>)}
    </section>

    <div className="radar-results-heading"><p aria-live="polite"><strong>{visible.length}</strong> {he ? "פריטים" : "items"}</p></div>
    {visible.length > 0 ? <><section className="radar-grid" aria-label={he ? "פריטי רדאר" : "Radar items"}>{rendered.map((record) => {
      const saved = guest.profile.favoriteIds.includes(record.canonicalId);
      const read = readIds.has(record.canonicalId);
      const followedTopic = record.topics.some((topic) => guest.profile.selectedTopics.includes(topic));
      const followedSource = guest.profile.selectedSources.includes(record.sourceId);
      const related = groups.get(record.duplicateGroupId ?? record.canonicalId)?.length ?? 1;
      const ranking = rankedById.get(record.canonicalId);
      return <article className="radar-card" key={record.canonicalId} data-read={read}>
        <div className="radar-card-meta"><span>{categoryLabels[record.category]?.[language] ?? record.category}</span><span>{freshnessLabels[record.freshness]?.[language] ?? record.freshness}</span><span>{record.sourceName}</span>{read && <span>{he ? "נקרא" : "Read"}</span>}{language === "he" && record.translationStatus !== "complete" && <span>{he ? "מקור באנגלית" : "English original"}</span>}</div>
        <h2>{localized(record, "title", language)}</h2>
        <p>{localized(record, "summary", language)}</p>
        <div className="radar-implication"><strong>{he ? "למה זה חשוב" : "Why it matters"}</strong><p>{localized(record, "whyItMatters", language)}</p></div>
        {view === "recommended" && <p className="recommendation-reason"><strong>{he ? "למה הומלץ" : "Why recommended"}:</strong> {recommendationExplanation(ranking?.reasons ?? [], language)}</p>}
        <dl>
          <div><dt>{he ? "פורסם" : "Published"}</dt><dd><time dateTime={record.publicationDate}>{new Date(`${record.publicationDate}T00:00:00Z`).toLocaleDateString(language)}</time></dd></div>
          <div><dt>{he ? "ביטחון" : "Confidence"}</dt><dd>{record.confidence}%</dd></div>
          <div><dt>{he ? "כיסוי קשור" : "Related coverage"}</dt><dd>{related}</dd></div>
        </dl>
        <div className="radar-card-actions">
          <button type="button" aria-pressed={saved} onClick={() => radar.toggleFavorite(record.canonicalId)}>{saved ? (he ? "הסרה מהשמורים" : "Remove saved") : (he ? "שמירה" : "Save")}</button>
          <button type="button" aria-pressed={read} onClick={() => radar.markRead(record, !read)}>{read ? (he ? "סימון כלא נקרא" : "Mark unread") : (he ? "סימון כנקרא" : "Mark read")}</button>
          <button type="button" aria-pressed={followedTopic} onClick={() => guest.toggleFollowTopic(record.topics[0] ?? record.category)}>{followedTopic ? (he ? "הפסקת מעקב נושא" : "Unfollow topic") : (he ? "מעקב נושא" : "Follow topic")}</button>
          <button type="button" aria-pressed={followedSource} onClick={() => guest.toggleFollowSource(record.sourceId)}>{followedSource ? (he ? "הפסקת מעקב מקור" : "Unfollow source") : (he ? "מעקב מקור" : "Follow source")}</button>
          <button type="button" onClick={() => guest.setRecommendationFeedback(record.canonicalId, "useful")}>{he ? "מועיל" : "Useful"}</button>
          <button type="button" onClick={() => guest.setRecommendationFeedback(record.canonicalId, "not-useful")}>{he ? "לא מועיל" : "Not useful"}</button>
          <button type="button" onClick={() => guest.toggleDismiss(record.canonicalId)}>{he ? "הסתרה" : "Dismiss"}</button>
          <a className="radar-source" href={record.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={() => { radar.recordView(record); radar.markRead(record); }}>{he ? "פתיחת המקור המקורי" : "Open original source"}</a>
        </div>
      </article>;
    })}</section>{rendered.length < visible.length && <button type="button" className="button radar-load-more" onClick={() => setVisibleLimit((limit) => limit + 24)}>{he ? "טעינת פריטים נוספים" : "Load more items"}</button>}</> : <section className="empty-state radar-empty"><h2>{he ? "אין פריטים בתצוגה" : "No items in this view"}</h2><p>{he ? "אפשר לשנות מסננים, לעקוב אחרי נושאים או לנסות עדכון חוזר." : "Change filters, follow topics, or retry refresh."}</p></section>}

    <form className="radar-feedback" onSubmit={submitFeedback}>
      <h2>{he ? "משוב ופרטיות" : "Feedback and privacy"}</h2>
      <p>{he ? "המשוב נשמר מקומית בלבד בגרסה זו. לא נאספים פרומפטים, מסמכים או זהות מדויקת." : "Feedback stays local in this release. Prompts, documents, and exact identity are not collected."}</p>
      <label>{he ? "סוג משוב" : "Feedback type"}<select value={feedbackCategory} onChange={(event) => setFeedbackCategory(event.target.value as FeedbackCategory)}>
        <option value="incorrect-summary">{he ? "סיכום שגוי" : "Incorrect summary"}</option>
        <option value="missing-topic">{he ? "נושא חסר" : "Missing topic"}</option>
        <option value="source-concern">{he ? "חשש לגבי מקור" : "Source concern"}</option>
        <option value="feature-request">{he ? "בקשת תכונה" : "Feature request"}</option>
        <option value="general">{he ? "כללי" : "General"}</option>
      </select></label>
      <label>{he ? "הודעה" : "Message"}<textarea required maxLength={500} value={feedbackMessage} onChange={(event) => setFeedbackMessage(event.target.value)} /></label>
      <button type="submit">{he ? "שמירה מקומית" : "Save locally"}</button>
      {feedbackStatus && <p role="status">{feedbackStatus}</p>}
    </form>
  </div>;
}
